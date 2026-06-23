"""
Phase 1 Genre Similarity Matrix Builder.

Derives cross-genre relationships from playlist co-occurrence
and stores them in genre_graph_edges for use by the
recommendation engine's anti-filter-bubble serendipity injection.
"""
import os
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv
from collections import defaultdict
import math

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_db_connection():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    register_vector(conn)
    return conn


def build_cooccurrence_matrix(conn) -> dict[tuple[str, str], int]:
    logger.info("Scanning playlist_tracks for genre co-occurrence...")
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT pt1.track_id as track_a, pt2.track_id as track_b
            FROM playlist_tracks pt1
            JOIN playlist_tracks pt2
              ON pt1.playlist_id = pt2.playlist_id
             AND pt1.track_id != pt2.track_id
            """
        )
        rows = cur.fetchall()

    track_genres: dict[str, str] = {}
    with conn.cursor() as cur:
        cur.execute(
            "SELECT track_id, genre_l2 FROM track_audio_features WHERE genre_l2 IS NOT NULL"
        )
        for track_id, genre_l2 in cur.fetchall():
            track_genres[track_id] = genre_l2

    cooccurrence: dict[tuple[str, str], int] = defaultdict(int)
    for row in rows:
        g1 = track_genres.get(str(row["track_a"]))
        g2 = track_genres.get(str(row["track_b"]))
        if g1 and g2 and g1 != g2:
            pair = (g1, g2) if g1 < g2 else (g2, g1)
            cooccurrence[pair] += 1

    logger.info(f"Found {len(cooccurrence)} genre pairs.")
    return cooccurrence


def normalize_to_similarity(
    cooccurrence: dict[tuple[str, str], int],
    min_count: int = 3,
) -> list[dict]:
    # Pointwise Mutual Information with smoothing
    total = sum(cooccurrence.values())
    genre_totals: dict[str, int] = defaultdict(int)
    for (g1, g2), count in cooccurrence.items():
        genre_totals[g1] += count
        genre_totals[g2] += count

    edges = []
    for (g1, g2), count in cooccurrence.items():
        if count < min_count:
            continue
        pmi = math.log((count / total) / ((genre_totals[g1] / total) * (genre_totals[g2] / total)))
        similarity = max(0.0, min(1.0, pmi / (pmi + 1.0)))  # sigmoid-ish squash
        edges.append({
            "genre_a": g1,
            "genre_b": g2,
            "similarity": round(similarity, 4),
            "edge_type": "playlist_cooccurrence",
            "count": count,
        })
    edges.sort(key=lambda x: x["similarity"], reverse=True)
    return edges


def upsert_genre_graph(conn, edges: list[dict]):
    logger.info(f"Upserting {len(edges)} genre graph edges...")
    with conn.cursor() as cur:
        # Resolve genre names to UUIDs
        genre_ids: dict[str, str] = {}
        cur.execute("SELECT id, name FROM genres WHERE name IS NOT NULL")
        for gid, name in cur.fetchall():
            genre_ids[name] = str(gid)

        for edge in edges:
            a_id = genre_ids.get(edge["genre_a"])
            b_id = genre_ids.get(edge["genre_b"])
            if not a_id or not b_id:
                continue
            cur.execute(
                """
                INSERT INTO genre_graph_edges (genre_a_id, genre_b_id, similarity_score, edge_type)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (genre_a_id, genre_b_id) DO UPDATE
                SET similarity_score = EXCLUDED.similarity_score,
                    edge_type = EXCLUDED.edge_type
                """,
                (a_id, b_id, edge["similarity"], edge["edge_type"]),
            )
    conn.commit()
    logger.info("Genre graph updated.")


def run_build():
    conn = get_db_connection()
    try:
        cooc = build_cooccurrence_matrix(conn)
        edges = normalize_to_similarity(cooc)
        upsert_genre_graph(conn, edges)
        logger.info("Genre similarity matrix build complete.")
    finally:
        conn.close()


if __name__ == "__main__":
    run_build()
