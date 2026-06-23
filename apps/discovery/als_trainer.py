import os
import logging
import numpy as np
import scipy.sparse as sp
import implicit
import psycopg2
from psycopg2.extras import RealDictCursor
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

WEIGHTS = {
    "play": 1.0,
    "skip": 0.0,
    "like": 3.0,
    "save": 4.0,
    "share": 5.0,
}


def popularity_penalty(play_count: int) -> float:
    if play_count > 1_000_000:
        return 0.2
    if play_count > 100_000:
        return 0.5
    if play_count > 10_000:
        return 0.8
    return 1.0


def build_interaction_matrix(conn):
    logger.info("Building interaction matrix...")
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT ie.user_id, ie.track_id, ie.event_type, COUNT(*) as event_count, t.stream_count
            FROM interaction_events ie
            JOIN tracks t ON t.id = ie.track_id
            WHERE ie.created_at > NOW() - INTERVAL '90 days'
              AND ie.event_type != 'skip'
            GROUP BY ie.user_id, ie.track_id, ie.event_type, t.stream_count
            """
        )
        rows = cur.fetchall()

    if not rows:
        logger.warning("No interaction data found. Skipping ALS training.")
        return None, None, None

    user_ids = sorted(set(r["user_id"] for r in rows))
    track_ids = sorted(set(r["track_id"] for r in rows))
    user_map = {uid: i for i, uid in enumerate(user_ids)}
    track_map = {tid: i for i, tid in enumerate(track_ids)}

    pair_weights: dict = {}
    for r in rows:
        uid = user_map[r["user_id"]]
        tid = track_map[r["track_id"]]
        weight = WEIGHTS.get(r["event_type"], 1.0) * r["event_count"]
        weight *= popularity_penalty(r["stream_count"] or 0)
        key = (uid, tid)
        pair_weights[key] = pair_weights.get(key, 0.0) + weight

    row_indices, col_indices, data = [], [], []
    for (uid, tid), weight in pair_weights.items():
        row_indices.append(uid)
        col_indices.append(tid)
        data.append(weight)

    matrix = sp.csr_matrix(
        (data, (row_indices, col_indices)), shape=(len(user_ids), len(track_ids))
    )
    logger.info(f"Matrix shape: {matrix.shape}, nnz: {matrix.nnz}")
    return matrix, user_ids, track_ids


def train_als(matrix, factors: int = 128):
    model = implicit.als.AlternatingLeastSquares(
        factors=factors,
        regularization=0.01,
        iterations=20,
        calculate_training_loss=True,
        use_gpu=False,
    )
    logger.info("Training ALS model...")
    model.fit(matrix)
    logger.info("ALS training complete.")
    return model.user_factors, model.item_factors


def store_factors(conn, user_factors, item_factors, user_ids, track_ids):
    logger.info("Storing ALS factors...")
    with conn.cursor() as cur:
        for i, user_id in enumerate(user_ids):
            cur.execute(
                """
                INSERT INTO als_user_factors (user_id, factors, updated_at)
                VALUES (%s, %s, NOW())
                ON CONFLICT (user_id) DO UPDATE
                SET factors = EXCLUDED.factors, updated_at = NOW()
                """,
                (user_id, user_factors[i].tolist()),
            )
        for i, track_id in enumerate(track_ids):
            cur.execute(
                """
                INSERT INTO als_item_factors (track_id, factors, updated_at)
                VALUES (%s, %s, NOW())
                ON CONFLICT (track_id) DO UPDATE
                SET factors = EXCLUDED.factors, updated_at = NOW()
                """,
                (track_id, item_factors[i].tolist()),
            )
    conn.commit()
    logger.info(f"Stored factors for {len(user_ids)} users, {len(track_ids)} tracks.")


def update_user_catalog_embeddings(conn):
    logger.info("Updating user catalog embeddings (ACARec)...")
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
              u.id as user_id,
              AVG(ta.clap_embedding) as mean_clap,
              AVG(aif.factors) as mean_als,
              jsonb_object_agg(ta.genre_l2, cnt) as genre_dist,
              COUNT(*) as track_count
            FROM tracks t
            JOIN users u ON u.id = t.artist_id
            JOIN track_audio_features ta ON ta.track_id = t.id
            LEFT JOIN als_item_factors aif ON aif.track_id = t.id
            LEFT JOIN (
              SELECT artist_id, genre_l2, COUNT(*) as cnt
              FROM tracks
              JOIN track_audio_features taf2 ON taf2.track_id = tracks.id
              WHERE genre_l2 IS NOT NULL
              GROUP BY artist_id, genre_l2
            ) gd ON gd.artist_id = t.artist_id
            WHERE ta.clap_embedding IS NOT NULL
            GROUP BY u.id
            """
        )
        rows = cur.fetchall()

    with conn.cursor() as cur:
        for row in rows:
            cur.execute(
                """
                INSERT INTO user_catalog_embeddings
                  (user_id, mean_clap_embedding, mean_als_factors, genre_distribution, track_count)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (user_id) DO UPDATE
                SET mean_clap_embedding = EXCLUDED.mean_clap_embedding,
                    mean_als_factors     = EXCLUDED.mean_als_factors,
                    genre_distribution   = EXCLUDED.genre_distribution,
                    track_count          = EXCLUDED.track_count,
                    updated_at           = NOW()
                """,
                (
                    row["user_id"],
                    row["mean_clap"],
                    row["mean_als"],
                    row["genre_dist"],
                    row["track_count"],
                ),
            )
    conn.commit()
    logger.info(f"Updated catalog embeddings for {len(rows)} users (artists).")


def update_user_embeddings(conn):
    logger.info("Updating user embeddings (taste centroid)...")
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
              ie.user_id,
              AVG(ta.clap_embedding) as taste_centroid,
              jsonb_object_agg(t.genre_l2, cnt) as genre_affinity,
              AVG(ta.mood_valence) as avg_valence,
              AVG(ta.mood_arousal) as avg_arousal,
              AVG(ta.bpm) as avg_bpm,
              COUNT(*) as track_count
            FROM interaction_events ie
            JOIN tracks t ON t.id = ie.track_id
            LEFT JOIN track_audio_features ta ON ta.track_id = t.id
            LEFT JOIN (
              SELECT user_id, track_id, COUNT(*) as cnt
              FROM interaction_events
              WHERE event_type IN ('play','like','save')
              GROUP BY user_id, track_id
            ) gd ON gd.user_id = ie.user_id AND gd.track_id = t.id
            WHERE ie.event_type IN ('play','like','save')
              AND ie.created_at > NOW() - INTERVAL '90 days'
              AND ta.clap_embedding IS NOT NULL
            GROUP BY ie.user_id
            """
        )
        rows = cur.fetchall()

    with conn.cursor() as cur:
        for row in rows:
            cur.execute(
                """
                INSERT INTO user_embeddings
                  (user_id, taste_centroid, genre_affinity, preferred_valence_range,
                   preferred_arousal_range, preferred_bpm_range, track_count)
                VALUES (%s, %s, %s, ARRAY[%s, %s], ARRAY[%s, %s], ARRAY[%s, %s], %s)
                ON CONFLICT (user_id) DO UPDATE
                SET taste_centroid       = EXCLUDED.taste_centroid,
                    genre_affinity       = EXCLUDED.genre_affinity,
                    preferred_valence_range = EXCLUDED.preferred_valence_range,
                    preferred_arousal_range = EXCLUDED.preferred_arousal_range,
                    preferred_bpm_range  = EXCLUDED.preferred_bpm_range,
                    track_count          = EXCLUDED.track_count,
                    updated_at           = NOW()
                """,
                (
                    row["user_id"],
                    row["taste_centroid"],
                    row["genre_affinity"],
                    float(row["avg_valence"] or 0.5) - 0.1,
                    float(row["avg_valence"] or 0.5) + 0.1,
                    float(row["avg_arousal"] or 0.5) - 0.1,
                    float(row["avg_arousal"] or 0.5) + 0.1,
                    float(row["avg_bpm"] or 120) - 10,
                    float(row["avg_bpm"] or 120) + 10,
                    row["track_count"],
                ),
            )
    conn.commit()
    logger.info(f"Updated user embeddings for {len(rows)} users.")


def run_training_job():
    logger.info(f"Starting ALS training job at {datetime.now()}")
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    register_vector(conn)
    try:
        matrix, user_ids, track_ids = build_interaction_matrix(conn)
        if matrix is None:
            return
        user_factors, item_factors = train_als(matrix)
        store_factors(conn, user_factors, item_factors, user_ids, track_ids)
        update_user_catalog_embeddings(conn)
        update_user_embeddings(conn)
        logger.info("ALS training job completed successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    run_training_job()
