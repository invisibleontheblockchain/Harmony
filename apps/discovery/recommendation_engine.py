import os
import logging
import json
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

WEIGHTS = {
    "clap_similarity": 0.35,
    "als_score": 0.25,
    "genre_match": 0.25,
    "freshness": 0.10,
    "popularity_penalty": 0.05,
}

CANDIDATE_POOL = int(os.environ.get("REC_CANDIDATE_POOL", "600"))
FINAL_LIMIT = int(os.environ.get("REC_FINAL_LIMIT", "50"))
CACHE_TTL_HOURS = int(os.environ.get("REC_CACHE_TTL_HOURS", "6"))


def get_db_connection():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    register_vector(conn)
    return conn


# ---------------------------------------------------------------------------
# Layer A — content/audio similarity (CLAP)
# ---------------------------------------------------------------------------
def get_user_clap_centroid(conn, user_id: str) -> Optional[np.ndarray]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT AVG(ta.clap_embedding) as centroid
            FROM interaction_events ie
            JOIN tracks t ON t.id = ie.track_id
            JOIN track_audio_features ta ON ta.track_id = t.id
            WHERE ie.user_id = %s
              AND ie.event_type IN ('play', 'like', 'save')
              AND ie.created_at > NOW() - INTERVAL '30 days'
              AND ta.clap_embedding IS NOT NULL
            """,
            (user_id,),
        )
        row = cur.fetchone()
    if row and row[0]:
        centroid = np.array(row[0], dtype=np.float32)
        norm = np.linalg.norm(centroid)
        return centroid / (norm + 1e-8) if norm > 0 else centroid
    return None


def get_candidate_tracks(
    conn, user_id: str, user_centroid: np.ndarray, limit: int = CANDIDATE_POOL
) -> list[dict]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
              t.id, t.title, t.artist_id, t.genre_l1, t.genre_l2, t.genre_l3, t.genre_l4,
              t.stream_count, t.created_at,
              1 - (ta.clap_embedding <=> %s::vector) as clap_similarity,
              aif.factors as als_factors,
              ta.bpm, ta.mood_valence, ta.mood_arousal
            FROM tracks t
            JOIN track_audio_features ta ON ta.track_id = t.id
            LEFT JOIN als_item_factors aif ON aif.track_id = t.id
            WHERE ta.clap_embedding IS NOT NULL
              AND t.id NOT IN (
                SELECT track_id FROM interaction_events
                WHERE user_id = %s AND event_type = 'play'
              )
            ORDER BY ta.clap_embedding <=> %s::vector
            LIMIT %s
            """,
            (user_centroid.tolist(), user_id, user_centroid.tolist(), limit),
        )
        return cur.fetchall()


# ---------------------------------------------------------------------------
# Layer B — collaborative filtering (ALS)
# ---------------------------------------------------------------------------
def get_user_als_factors(conn, user_id: str) -> Optional[np.ndarray]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT factors FROM als_user_factors WHERE user_id = %s", (user_id,)
        )
        row = cur.fetchone()
    if row and row[0]:
        return np.array(row[0], dtype=np.float32)
    return None


# ---------------------------------------------------------------------------
# Layer C — genre graph / taxonomy matching
# ---------------------------------------------------------------------------
def get_user_genre_history(conn, user_id: str) -> dict[str, int]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT t.genre_l4, COUNT(*) as cnt
            FROM interaction_events ie
            JOIN tracks t ON t.id = ie.track_id
            WHERE ie.user_id = %s
              AND ie.event_type IN ('play', 'like', 'save')
            GROUP BY t.genre_l4
            """,
            (user_id,),
        )
        rows = cur.fetchall()
    return {r["genre_l4"]: r["cnt"] for r in rows if r["genre_l4"]}


def get_adjacent_genres(user_genre_history: dict[str, int], top_k: int = 15) -> list[str]:
    if not user_genre_history:
        return []
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            known = list(user_genre_history.keys())
            cur.execute(
                """
                SELECT ge.genre_b_id, ge.similarity_score, g.name
                FROM genre_graph_edges ge
                JOIN genres g ON g.id = ge.genre_b_id
                WHERE ge.genre_a_id = ANY(%s::uuid[])
                ORDER BY ge.similarity_score DESC
                LIMIT %s
                """,
                (known, top_k * 3),
            )
            rows = cur.fetchall()
        return [r[1] for r in rows]  # genre names sorted by score desc
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Layer D — cold start (ACARec)
# ---------------------------------------------------------------------------
def get_cold_start_embedding(conn, track_id: str) -> Optional[np.ndarray]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT t.artist_id
            FROM tracks t
            WHERE t.id = %s
            """,
            (track_id,),
        )
        row = cur.fetchone()
    if not row:
        return None
    artist_id = row[0]
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT mean_als_factors
            FROM artist_catalog_embeddings
            WHERE artist_id = %s AND mean_als_factors IS NOT NULL
            """,
            (artist_id,),
        )
        row = cur.fetchone()
    if row and row[0]:
        return np.array(row[0], dtype=np.float32)
    return None


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------
def score_candidates(
    candidates: list[dict],
    user_als_factors: Optional[np.ndarray],
    user_genre_history: dict[str, int],
) -> list[dict]:
    scored = []
    conn = get_db_connection()
    try:
        for track in candidates:
            clap_sim = float(track.get("clap_similarity", 0.0) or 0.0)

            als_score = 0.0
            als_factors = track.get("als_factors")
            if user_als_factors is not None:
                if als_factors is not None:
                    item_vec = np.array(als_factors, dtype=np.float32)
                    dot = float(np.dot(user_als_factors, item_vec))
                    als_score = min(max(dot, 0.0), 1.0)
                else:
                    # ACARec cold-start fallback: use artist's catalog mean ALS factors
                    artist_id = track.get("artist_id")
                    if artist_id:
                        with conn.cursor() as cur:
                            cur.execute(
                                "SELECT mean_als_factors FROM user_catalog_embeddings WHERE user_id = %s",
                                (artist_id,),
                            )
                            row = cur.fetchone()
                        if row and row[0]:
                            catalog_vec = np.array(row[0], dtype=np.float32)
                            dot = float(np.dot(user_als_factors, catalog_vec))
                            als_score = min(max(dot, 0.0), 1.0) * 0.8

            genre_score = 0.0
            g4 = track.get("genre_l4")
            g3 = track.get("genre_l3")
            g2 = track.get("genre_l2")
            if g4 and g4 in user_genre_history:
                genre_score = 1.0
            elif g3 and g3 in user_genre_history:
                genre_score = 0.7
            elif g2 and g2 in user_genre_history:
                genre_score = 0.4

            days_old = (datetime.now() - track["created_at"].replace(tzinfo=None)).days
            freshness = max(0.0, 1.0 - (days_old / 30.0)) if days_old < 30 else 0.0

            plays = track.get("stream_count") or 0
            pop_penalty = min(plays / 1_000_000.0, 1.0)

            final_score = (
                WEIGHTS["clap_similarity"] * clap_sim
                + WEIGHTS["als_score"] * als_score
                + WEIGHTS["genre_match"] * genre_score
                + WEIGHTS["freshness"] * freshness
                - WEIGHTS["popularity_penalty"] * pop_penalty
            )

            scored.append({**dict(track), "final_score": final_score})
        return sorted(scored, key=lambda x: x["final_score"], reverse=True)
    finally:
        conn.close()


def enforce_diversity(
    recommendations: list[dict], max_l2_fraction: float = 0.70
) -> list[dict]:
    if not recommendations:
        return recommendations
    from collections import Counter

    l2_counts = Counter(t.get("genre_l2") for t in recommendations if t.get("genre_l2"))
    total = len(recommendations)
    if not total:
        return recommendations
    dominant_genre, dominant_count = l2_counts.most_common(1)[0]
    if dominant_count / total > max_l2_fraction:
        max_allowed = int(total * max_l2_fraction)
        n_to_replace = dominant_count - max_allowed
        dominant_tracks = [
            t for t in recommendations if t.get("genre_l2") == dominant_genre
        ]
        dominant_tracks.sort(key=lambda t: t.get("final_score", 0))
        to_remove = {t["id"] for t in dominant_tracks[:n_to_replace]}
        recommendations = [
            t for t in recommendations if t["id"] not in to_remove
        ]
    return recommendations


def get_track_metadata(conn, track_ids: list[str]) -> dict[str, dict]:
    if not track_ids:
        return {}
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT t.id, t.title, t.artist_id, t.genre_l1, t.genre_l2, t.genre_l3, t.genre_l4,
                   t.stream_count, t.created_at, t.file_url_hls, t.duration_seconds,
                   u.display_name AS artist_name, u.avatar_url AS artist_avatar
            FROM tracks t
            JOIN users u ON u.id = t.artist_id
            WHERE t.id = ANY(%s::uuid[])
            """,
            (track_ids,),
        )
        rows = cur.fetchall()
    return {r["id"]: r for r in rows}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def get_recommendations(user_id: str, limit: int = FINAL_LIMIT) -> list[dict]:
    conn = get_db_connection()
    try:
        # Cache check
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT recommendations, algorithm_version
                FROM recommendation_cache
                WHERE user_id = %s AND expires_at > NOW()
                """,
                (user_id,),
            )
            cached = cur.fetchone()
        if cached:
            results = cached["recommendations"][:limit]
            enriched = get_track_metadata(conn, [r["track_id"] for r in results])
            return [enriched.get(r["track_id"], r) for r in results]

        user_centroid = get_user_clap_centroid(conn, user_id)
        if user_centroid is None:
            return get_cold_start_recommendations(conn, limit)

        candidates = get_candidate_tracks(conn, user_id, user_centroid)
        user_als = get_user_als_factors(conn, user_id)
        user_genre_history = get_user_genre_history(conn, user_id)
        scored = score_candidates(candidates, user_als, user_genre_history)
        diverse = enforce_diversity(scored)
        top = diverse[:limit]

        track_ids = [t["id"] for t in top]
        metadata = get_track_metadata(conn, track_ids)
        final = []
        for t in top:
            meta = metadata.get(t["id"], {})
            final.append(
                {
                    "track_id": t["id"],
                    "rank": len(final) + 1,
                    "final_score": t["final_score"],
                    "is_serendipity": False,
                    **meta,
                }
            )

        # Populate cache
        cache_payload = [
            {"track_id": t["track_id"], "rank": t["rank"], "final_score": t["final_score"]}
            for t in final
        ]
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO recommendation_cache (user_id, recommendations, algorithm_version, expires_at)
                VALUES (%s, %s, %s, NOW() + INTERVAL '%s hours')
                ON CONFLICT (user_id) DO UPDATE
                SET recommendations = EXCLUDED.recommendations,
                    algorithm_version = EXCLUDED.algorithm_version,
                    generated_at = NOW(),
                    expires_at = EXCLUDED.expires_at
                """,
                (user_id, Json(cache_payload), "v4-layer-v1", CACHE_TTL_HOURS),
            )
        conn.commit()
        return final
    finally:
        conn.close()


def get_cold_start_recommendations(conn, limit: int) -> list[dict]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT t.id, t.title, t.artist_id, t.genre_l1, t.genre_l2, t.genre_l3, t.genre_l4,
                   t.stream_count, t.created_at, t.file_url_hls, t.duration_seconds,
                   u.display_name AS artist_name, u.avatar_url AS artist_avatar
            FROM tracks t
            JOIN users u ON u.id = t.artist_id
            WHERE t.audio_processed_at IS NOT NULL
              AND t.stream_count < 10000
            ORDER BY t.created_at DESC
            LIMIT %s
            """,
            (limit,),
        )
        rows = cur.fetchall()
    return [
        {
            "track_id": r["id"],
            "rank": i + 1,
            "final_score": 0.5,
            "is_serendipity": False,
            **r,
        }
        for i, r in enumerate(rows)
    ]
