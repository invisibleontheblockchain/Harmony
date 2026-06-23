import os
import tempfile
import logging
from pathlib import Path
from typing import Optional
import numpy as np
import torch
import torchaudio
import essentia.standard as es
from msclap import CLAP
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv

from genre_classifier import classify_track

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CLAP_VERSION = os.environ.get("CLAP_VERSION", "2023")
CLAP_USE_CUDA = os.environ.get("CLAP_USE_CUDA", "false").lower() == "true"

logger.info(f"Loading CLAP model (version={CLAP_VERSION}, cuda={CLAP_USE_CUDA})...")
clap_model = CLAP(version=CLAP_VERSION, use_cuda=CLAP_USE_CUDA)
logger.info("CLAP model loaded.")


def get_db_connection():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    register_vector(conn)
    return conn


def extract_clap_embedding(audio_path: str) -> np.ndarray:
    embeddings = clap_model.get_audio_embeddings([audio_path])
    embedding = embeddings[0]
    embedding = embedding / (np.linalg.norm(embedding) + 1e-8)
    return embedding.astype(np.float32)


def extract_essentia_features(audio_path: str) -> dict:
    loader = es.MonoLoader(filename=audio_path, sampleRate=44100)
    audio = loader()

    features: dict = {}

    # Rhythm
    rhythm_extractor = es.RhythmExtractor2013(method="multifeature")
    bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)
    features["bpm"] = float(bpm)
    features["beats_confidence"] = float(beats_confidence)

    # Key / scale
    key_extractor = es.KeyExtractor()
    key, scale, key_strength = key_extractor(audio)
    features["key"] = key
    features["scale"] = scale
    features["key_strength"] = float(key_strength)

    # Loudness
    loudness = es.Loudness()(audio)
    features["loudness"] = float(loudness)

    # Danceability
    danceability, _ = es.Danceability()(audio)
    features["danceability"] = float(danceability)

    # MFCC
    w = es.Windowing(type="hann")
    spec = es.Spectrum()
    mfcc = es.MFCC(numberCoefficients=13)
    mfcc_frames = []
    for frame in es.FrameGenerator(audio, frameSize=2048, hopSize=512):
        spectrum = spec(w(frame))
        _, mfcc_coeffs = mfcc(spectrum)
        mfcc_frames.append(mfcc_coeffs)
    mfcc_mean = np.mean(mfcc_frames, axis=0).tolist()
    features["mfcc_mean"] = mfcc_mean

    # Spectral features
    spectral_centroid = es.SpectralCentroidTime()(audio)
    features["spectral_centroid"] = float(spectral_centroid)

    return features


def process_track(track_id: str, audio_path: str) -> dict:
    logger.info(f"Processing track {track_id}: {audio_path}")
    try:
        clap_embedding = extract_clap_embedding(audio_path)
        essentia_features = extract_essentia_features(audio_path)

        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE tracks
                    SET essentia_features = %s,
                        audio_processed_at = NOW()
                    WHERE id = %s
                    """,
                    (
                        Json(essentia_features),
                        track_id,
                    ),
                )
                cur.execute(
                    """
                    INSERT INTO track_audio_features (
                        track_id, clap_embedding, bpm, key, key_strength,
                        danceability, mfcc_mean, spectral_centroid, essentia_features
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (track_id) DO UPDATE SET
                        clap_embedding = EXCLUDED.clap_embedding,
                        bpm = EXCLUDED.bpm,
                        key = EXCLUDED.key,
                        key_strength = EXCLUDED.key_strength,
                        danceability = EXCLUDED.danceability,
                        mfcc_mean = EXCLUDED.mfcc_mean,
                        spectral_centroid = EXCLUDED.spectral_centroid,
                        essentia_features = EXCLUDED.essentia_features,
                        processed_at = NOW()
                    """,
                    (
                        track_id,
                        clap_embedding.tolist(),
                        essentia_features.get("bpm"),
                        essentia_features.get("key"),
                        essentia_features.get("key_strength"),
                        essentia_features.get("danceability"),
                        essentia_features.get("mfcc_mean"),
                        essentia_features.get("spectral_centroid"),
                        Json(essentia_features),
                    ),
                )
            conn.commit()

            # Phase 1 genre classification (heuristic; swap for CT-GateNet when trained)
            classify_track(conn, track_id, essentia_features)
        finally:
            conn.close()

        logger.info(f"Track {track_id} processed. BPM: {essentia_features.get('bpm', 'N/A')}")
        return {
            "track_id": track_id,
            "clap_embedding": clap_embedding,
            "essentia_features": essentia_features,
            "status": "success",
        }
    except Exception as e:
        logger.error(f"Failed to process track {track_id}: {e}")
        raise


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python audio_processor.py <track_id> <audio_path>")
        sys.exit(1)
    process_track(sys.argv[1], sys.argv[2])
