import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx

from audio_processor import process_track
from recommendation_engine import get_recommendations, get_cold_start_recommendations
import psycopg2
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Discovery service starting up...")
    yield
    logger.info("Discovery service shutting down...")


app = FastAPI(title="Harmony Discovery Engine", lifespan=lifespan)


class ProcessRequest(BaseModel):
    track_id: str
    audio_url: str


class RecommendRequest(BaseModel):
    user_id: str
    limit: int = 50


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/process")
async def process_audio(request: ProcessRequest):
    try:
        result = process_track(request.track_id, request.audio_url)
        return result
    except Exception as e:
        logger.error(f"Audio processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendations")
def recommendations(req: RecommendRequest):
    try:
        recs = get_recommendations(req.user_id, req.limit)
        return {"user_id": req.user_id, "recommendations": recs}
    except Exception as e:
        logger.error(f"Recommendation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
