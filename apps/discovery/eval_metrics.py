"""
Phase 1 Evaluation Metrics Runner.

Computes the 7 core metrics from Section 6 of the Harmony
recommendation spec against the live recommendation_cache table.

Usage:
    python eval_metrics.py [--days 7] [--version v4-layer-v1]
"""
import os
import sys
import math
import argparse
import logging
from datetime import datetime, timedelta

import psycopg2
from psycopg2.extras import RealDictCursor
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_db_connection():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    register_vector(conn)
    return conn


def compute_ndcg_at_10(conn, days: int = 7, algorithm_version: str | None = None) -> float:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        query = """
        WITH ranked_recs AS (
          SELECT rc.user_id, rec.track_id, rec.rank,
            CASE
              WHEN ie.play_duration_seconds::float / t.duration_seconds > 0.8 THEN 3
              WHEN ie.play_duration_seconds::float / t.duration_seconds > 0.3 THEN 2
              WHEN ie.event_type = 'play' THEN 1
              ELSE 0
            END as relevance
          FROM recommendation_cache rc,
            jsonb_array_elements(rc.recommendations) WITH ORDINALITY AS rec(rec, rank)
          JOIN tracks t ON t.id = (rec->>'track_id')::uuid
          LEFT JOIN interaction_events ie
            ON ie.track_id = t.id
            AND ie.user_id = rc.user_id
            AND ie.created_at > rc.generated_at
            AND ie.created_at < rc.generated_at + INTERVAL '7 days'
          WHERE rec.rank <= 10
            AND rc.generated_at > NOW() - INTERVAL '%s days'
        """
        params: list = [days]
        if algorithm_version:
            query += " AND rc.algorithm_version = %s"
            params.append(algorithm_version)
        query += """
        ),
        dcg AS (
          SELECT user_id, SUM(relevance / LOG(2, rank + 1)) as dcg
          FROM ranked_recs
          GROUP BY user_id
        )
        SELECT AVG(dcg) as mean_ndcg_10 FROM dcg
        """
        cur.execute(query, params)
        row = cur.fetchone()
    return float(row["mean_ndcg_10"] or 0.0)


def compute_precision_at_10(conn, days: int = 7, algorithm_version: str | None = None) -> float:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        query = """
        WITH user_recs AS (
          SELECT rc.user_id, rec.track_id
          FROM recommendation_cache rc,
            jsonb_array_elements(rc.recommendations) WITH ORDINALITY AS rec(rec, rank)
          WHERE rec.rank <= 10
            AND rc.generated_at > NOW() - INTERVAL '%s days'
        """
        params: list = [days]
        if algorithm_version:
            query += " AND rc.algorithm_version = %s"
            params.append(algorithm_version)
        query += """
        ),
        relevant AS (
          SELECT ur.user_id, COUNT(*) as relevant_count
          FROM user_recs ur
          JOIN interaction_events ie
            ON ie.track_id = ur.track_id
            AND ie.user_id = ur.user_id
            AND ie.event_type IN ('play', 'like', 'save')
            AND ie.created_at > rc.generated_at
            AND ie.created_at < rc.generated_at + INTERVAL '7 days'
          GROUP BY ur.user_id
        )
        SELECT AVG(relevant_count) / 10.0 as precision_at_10
        FROM relevant
        """
        cur.execute(query, params)
        row = cur.fetchone()
    return float(row["precision_at_10"] or 0.0)


def compute_serendipity(conn, days: int = 7) -> float:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            WITH user_recent AS (
              SELECT user_id, track_id, clap_embedding
              FROM interaction_events ie
              JOIN track_audio_features taf ON taf.track_id = ie.track_id
              WHERE ie.event_type IN ('play', 'like', 'save')
                AND ie.created_at > NOW() - INTERVAL '%s days'
                AND taf.clap_embedding IS NOT NULL
            ),
            rec_embeddings AS (
              SELECT rc.user_id, rec.track_id, taf.clap_embedding
              FROM recommendation_cache rc,
                jsonb_array_elements(rc.recommendations) WITH ORDINALITY AS rec(rec, rank)
              JOIN track_audio_features taf ON taf.track_id = (rec->>'track_id')::uuid
              WHERE rec.rank <= 10
                AND rc.generated_at > NOW() - INTERVAL '%s days'
            )
            SELECT
              AVG(
                1 - (
                  SELECT MAX(1 - (re.clap_embedding <=> ur.clap_embedding))
                  FROM user_recent ur
                  WHERE ur.user_id = re.user_id
                )
              ) as serendipity
            FROM rec_embeddings re
            """,
            [days, days],
        )
        row = cur.fetchone()
    return float(row["serendipity"] or 0.0)


def compute_diversity(conn, days: int = 7) -> float:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            WITH recs AS (
              SELECT rc.user_id, rec.rank, taf.clap_embedding
              FROM recommendation_cache rc,
                jsonb_array_elements(rc.recommendations) WITH ORDINALITY AS rec(rec, rank)
              JOIN track_audio_features taf ON taf.track_id = (rec->>'track_id')::uuid
              WHERE rec.rank <= 10
                AND rc.generated_at > NOW() - INTERVAL '%s days'
            )
            SELECT
              AVG(
                COUNT(*) FILTER (WHERE r1.rank < r2.rank)::float
                / NULLIF((COUNT(*) * (COUNT(*) - 1) / 2), 0)
              ) as diversity
            FROM recs r1
            JOIN recs r2 ON r1.user_id = r2.user_id AND r1.rank < r2.rank
            WHERE r1.clap_embedding IS NOT NULL AND r2.clap_embedding IS NOT NULL
            """,
            [days],
        )
        row = cur.fetchone()
    return float(row["diversity"] or 0.0)


def compute_iadr(conn, days: int = 7) -> float:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
              COUNT(CASE WHEN a.total_streams < 10000 THEN 1 END)::float / COUNT(*) as iadr
            FROM recommendation_cache rc,
              jsonb_array_elements(rc.recommendations) AS rec
            JOIN tracks t ON t.id = (rec->>'track_id')::uuid
            JOIN artists a ON a.id = t.artist_id
            WHERE rc.generated_at > NOW() - INTERVAL '%s days'
            """,
            [days],
        )
        row = cur.fetchone()
    return float(row["iadr"] or 0.0)


def compute_cold_start_ndcg(conn, days: int = 7) -> float:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            WITH ranked_recs AS (
              SELECT rc.user_id, rec.track_id, rec.rank,
                CASE
                  WHEN ie.play_duration_seconds::float / t.duration_seconds > 0.8 THEN 3
                  WHEN ie.play_duration_seconds::float / t.duration_seconds > 0.3 THEN 2
                  WHEN ie.event_type = 'play' THEN 1
                  ELSE 0
                END as relevance
              FROM recommendation_cache rc,
                jsonb_array_elements(rc.recommendations) WITH ORDINALITY AS rec(rec, rank)
              JOIN tracks t ON t.id = (rec->>'track_id')::uuid
              LEFT JOIN interaction_events ie
                ON ie.track_id = t.id
                AND ie.user_id = rc.user_id
                AND ie.created_at > rc.generated_at
                AND ie.created_at < rc.generated_at + INTERVAL '7 days'
              WHERE rec.rank <= 10
                AND rc.generated_at > NOW() - INTERVAL '%s days'
                AND t.stream_count < 100
            ),
            dcg AS (
              SELECT user_id, SUM(relevance / LOG(2, rank + 1)) as dcg
              FROM ranked_recs
              GROUP BY user_id
            )
            SELECT AVG(dcg) as cold_start_ndcg FROM dcg
            """,
            [days],
        )
        row = cur.fetchone()
    return float(row["cold_start_ndcg"] or 0.0)


def compute_genre_depth(conn, days: int = 7) -> float:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
              AVG(
                CASE
                  WHEN t.genre_l4 IS NOT NULL THEN 4
                  WHEN t.genre_l3 IS NOT NULL THEN 3
                  WHEN t.genre_l2 IS NOT NULL THEN 2
                  ELSE 1
                END
              ) as genre_depth
            FROM recommendation_cache rc,
              jsonb_array_elements(rc.recommendations) AS rec
            JOIN tracks t ON t.id = (rec->>'track_id')::uuid
            WHERE rc.generated_at > NOW() - INTERVAL '%s days'
            """,
            [days],
        )
        row = cur.fetchone()
    return float(row["genre_depth"] or 0.0)


def store_evaluation(conn, metrics: dict, algorithm_version: str):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO evaluation_runs (
              algorithm_version, ndcg_at_10, precision_at_10, serendipity_at_10,
              diversity_at_10, independent_artist_discovery_rate, cold_start_ndcg,
              genre_depth_score
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                algorithm_version,
                metrics["ndcg_at_10"],
                metrics["precision_at_10"],
                metrics["serendipity_at_10"],
                metrics["diversity_at_10"],
                metrics["iadr"],
                metrics["cold_start_ndcg"],
                metrics["genre_depth"],
            ),
        )
    conn.commit()


def main():
    parser = argparse.ArgumentParser(description="Harmony evaluation metrics runner")
    parser.add_argument("--days", type=int, default=7, help="Lookback window in days")
    parser.add_argument("--version", type=str, default=None, help="Algorithm version filter")
    args = parser.parse_args()

    conn = get_db_connection()
    try:
        logger.info(f"Computing metrics for last {args.days} days...")
        metrics = {
            "ndcg_at_10": compute_ndcg_at_10(conn, args.days, args.version),
            "precision_at_10": compute_precision_at_10(conn, args.days, args.version),
            "serendipity_at_10": compute_serendipity(conn, args.days),
            "diversity_at_10": compute_diversity(conn, args.days),
            "iadr": compute_iadr(conn, args.days),
            "cold_start_ndcg": compute_cold_start_ndcg(conn, args.days),
            "genre_depth": compute_genre_depth(conn, args.days),
        }
        version = args.version or "v4-layer-v1"
        store_evaluation(conn, metrics, version)
        for k, v in metrics.items():
            logger.info(f"{k}: {v:.4f}")
        print("EVAL_OK")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
