"""
Phase 1 Genre Classifier (Harmony CT-GateNet stub).

For Phase 1, this module uses audio-feature heuristics to assign
L1/L2 genre labels until a trained CT-GateNet model is available.

Full CT-GateNet architecture (CNN-Transformer + hierarchical heads)
is defined in the class below; uncomment and train when labeled data
is ready.
"""
import os
import logging
import numpy as np
import psycopg2
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Heuristic fallback (works immediately without training data)
# ---------------------------------------------------------------------------
HEURISTIC_RULES = [
    ({("bpm", 168, 200, "danceability", 0.6)}, "Electronic", "House", "Deep House", "Organic Deep House"),
    ({("bpm", 120, 140, "danceability", 0.5)}, "Electronic", "House", "Tech House", "Driving Tech House"),
    ({("bpm", 130, 160, "danceability", 0.7)}, "Electronic", "Techno", "Melodic Techno", "Hypnotic Melodic Techno"),
    ({("bpm", 160, 200, "spectral_centroid", 3000, 10000)}, "Electronic", "Drum and Bass", "Liquid DnB", "Soulful Liquid"),
    ({("bpm", 140, 175, "spectral_centroid", 4000, 12000)}, "Electronic", "Drum and Bass", "Neurofunk", "Dark Neurofunk"),
    ({("bpm", 80, 110, "danceability", 0.4, 0.7)}, "Hip-Hop", "Trap", "Melodic Trap", "Dark Trap"),
    ({("bpm", 85, 99, "danceability", 0.3, 0.6)}, "Hip-Hop", "Lo-Fi Hip-Hop", "Lo-Fi Beats", "Chillhop"),
    ({("bpm", 60, 80, "danceability", 0.2, 0.5)}, "R&B / Soul", "Alternative R&B", "Indie R&B", "Experimental R&B"),
    ({("bpm", 120, 140, "danceability", 0.5, 0.8)}, "Electronic", "House", "Afro House", None),
    ({("bpm", 100, 130, "danceability", 0.4, 0.7)}, "Hip-Hop", "Drill", "UK Drill", None),
]


def heuristic_classify(features: dict) -> tuple[str, str, str, str]:
    bpm = features.get("bpm", 120) or 120
    dance = features.get("danceability", 0.5) or 0.5
    spec = features.get("spectral_centroid", 2000) or 2000

    for rule_set in HEURISTIC_RULES:
        for i in range(0, len(rule_set[0]), 4):
            key = rule_set[0][i]
            low = rule_set[0][i + 1]
            high = rule_set[0][i + 2]
            val = features.get(key, 0) or 0
            if not (low <= val <= high):
                break
        else:
            return rule_set[1], rule_set[2], rule_set[3], rule_set[4]

    if bpm > 140:
        return "Electronic", "Experimental Bass", "Glitch Hop", "Wonky"
    if bpm < 90:
        return "Hip-Hop", "Lo-Fi Hip-Hop", "Lo-Fi Beats", "Chillhop"
    return "Electronic", "House", "Deep House", "Organic Deep House"


def classify_track(conn, track_id: str, features: dict) -> dict:
    l1, l2, l3, l4 = heuristic_classify(features)
    genre_level = 4 if l4 else (3 if l3 else (2 if l2 else 1))
    genre_confidence = 0.75 if l4 else (0.65 if l3 else (0.55 if l2 else 0.45))

    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE tracks
            SET genre_l1 = %s, genre_l2 = %s, genre_l3 = %s, genre_l4 = %s,
                genre_confidence = %s, genre_level = %s
            WHERE id = %s
            """,
            (l1, l2, l3, l4, genre_confidence, genre_level, track_id),
        )
    logger.info(f"Track {track_id}: {l1} > {l2} > {l3} > {l4} (confidence={genre_confidence:.2f})")
    return {
        "genre_l1": l1,
        "genre_l2": l2,
        "genre_l3": l3,
        "genre_l4": l4,
        "genre_confidence": genre_confidence,
        "genre_level": genre_level,
    }


# ---------------------------------------------------------------------------
# CT-GateNet architecture (disabled until training data is available)
# ---------------------------------------------------------------------------
if False:  # flip to True once model weights are trained
    import torch
    import torch.nn as nn
    import torchaudio.transforms as T

    class MelSpectrogramExtractor(nn.Module):
        def __init__(self, sample_rate=44100, n_mels=128, hop_length=512, n_fft=2048):
            super().__init__()
            self.mel_transform = T.MelSpectrogram(
                sample_rate=sample_rate, n_fft=n_fft, hop_length=hop_length,
                n_mels=n_mels, f_min=20.0, f_max=20000.0,
            )
            self.amplitude_to_db = T.AmplitudeToDB()

        def forward(self, waveform):
            mel = self.mel_transform(waveform)
            mel_db = self.amplitude_to_db(mel)
            mel_db = (mel_db - mel_db.mean()) / (mel_db.std() + 1e-8)
            return mel_db

    class CTGateNet(nn.Module):
        def __init__(self, n_l1, n_l2, n_l3, n_l4):
            super().__init__()
            self.mel_extractor = MelSpectrogramExtractor()
            # ... (full architecture from Section 3.2 of spec)
            # head_l1 = Linear(512, n_l1)
            # head_l2 = Linear(512 + n_l1, n_l2)
            # head_l3 = Linear(512 + n_l2, n_l3)
            # head_l4 = Linear(512 + n_l3, n_l4)

        def forward(self, waveform):
            mel = self.mel_extractor(waveform)
            # ... (CNN backbone + Transformer + heads)
            pass
