from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from implicit.als import AlternatingLeastSquares
import numpy as np
import os

app = FastAPI(title="Harmony Recommendation Microservice")

model = None
user_index = {}
item_index = {}
index_item = {}

class RecommendRequest(BaseModel):
    user_id: int
    n: int = 20

class TrainResponse(BaseModel):
    status: str
    users: int
    items: int

def build_index(df: pd.DataFrame):
    global user_index, item_index, index_item
    user_index = {uid: i for i, uid in enumerate(df["user_id"].unique())}
    item_index = {iid: i for i, iid in enumerate(df["item_id"].unique())}
    index_item = {i: iid for iid, i in item_index.items()}

def fit_model(df: pd.DataFrame):
    global model, user_index, item_index, index_item
    build_index(df)
    user_item = pd.pivot_table(df, index="user_id", columns="item_id", values="weight", fill_value=0)
    sparse = user_item.astype(pd.SparseDtype(float, 0)).sparse.to_coo().tocsr()
    model = AlternatingLeastSquares(factors=64, regularization=0.05, iterations=20, random_state=42)
    model.fit(sparse.T)
    return TrainResponse(status="trained", users=sparse.shape[0], items=sparse.shape[1])

@app.post("/train", response_model=TrainResponse)
def train(data: list[dict]):
    df = pd.DataFrame(data)
    required = {"user_id", "item_id", "weight"}
    if not required.issubset(df.columns):
        raise ValueError(f"Missing columns: {required - set(df.columns)}")
    return fit_model(df)

@app.get("/recommend")
def recommend(user_id: int, n: int = 20):
    if model is None:
        # Crude fallback: return most popular items without training
        return {"user_id": user_id, "recommendations": []}
    uidx = user_index.get(user_id)
    if uidx is None:
        return {"user_id": user_id, "recommendations": []}
    ids, scores = model.recommend(uidx, model.item_factors, N=n, filter_already_liked_items=True)
    return {
        "user_id": user_id,
        "recommendations": [{"track_id": int(index_item[i]), "score": float(s)} for i, s in zip(ids, scores)],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
