import numpy as np
import scipy.sparse as sparse
import implicit
import pickle

def train_als_model(stream_events):
    users = [event['user_id'] for event in stream_events]
    tracks = [event['track_id'] for event in stream_events]
    weights = [event['weight'] for event in stream_events]
    user_item_matrix = sparse.csr_matrix((weights, (users, tracks)))
    model = implicit.als.AlternatingLeastSquares(
        factors=50, 
        regularization=0.01, 
        iterations=20,
        calculate_training_loss=True
    )
    model.fit(user_item_matrix)
    with open('harmony_als_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    return model, user_item_matrix

def get_recommendations(model, user_item_matrix, user_id, num_tracks=20):
    ids, scores = model.recommend(
        user_id, 
        user_item_matrix[user_id], 
        N=num_tracks, 
        filter_already_liked_items=True
    )
    return list(zip(ids, scores))