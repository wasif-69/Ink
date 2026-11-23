from bertopic import BERTopic
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
import numpy as np
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


app=Flask(__name__)
CORS(app)


load_dotenv(".env.local")
mongo_uri = os.environ.get("MONGODB_URL")

client = MongoClient(mongo_uri)
db = client["newsbite"]
collection = db["articles"]
documents = list(collection.find())
for doc in documents:
  doc["_id"] = str(doc["_id"])
  if isinstance(doc.get("time"), datetime):
    doc["time"] = doc["time"].isoformat()

titles = [doc.get("title", "") for doc in documents]

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = embedding_model.encode(titles, show_progress_bar=False)

def parse_timestamp(ts):
  """Safely converts ISO string, datetime object, or Unix timestamp into UTC datetime."""
  if isinstance(ts, datetime):
    return ts if ts.tzinfo else ts.replace(tzinfo=timezone.utc)
  if isinstance(ts, (int, float)):
    # Handle milliseconds vs seconds
    if ts > 1e11:
      ts = ts / 1000.0
    return datetime.fromtimestamp(ts, tz=timezone.utc)
  if isinstance(ts, str) and ts.strip():
    try:
      dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
      return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except ValueError:
      pass
  return None



@app.route("/article", methods=["POST"])
def articles():
  try:
    if not documents:
      return {"documents": []}

    data = request.get_json(silent=True) or {}
    message = str(data.get("message", ""))

    # Use request time if provided, otherwise current UTC time
    ref_time = parse_timestamp(data.get("time")) or datetime.now(timezone.utc)

    # 1. Text similarity scores (0 to 1)
    query_embedding = embedding_model.encode([message], show_progress_bar=False)
    doc_embeddings = np.atleast_2d(embeddings)
    similarities = cosine_similarity(query_embedding, doc_embeddings)[0]

    # 2. Recency scores (0 to 1, where newer = closer to 1)
    # half-life ~ 72 hours (3 days); adjust decay_hours for faster/slower decay
    decay_hours = 72.0
    recency_scores = np.zeros(len(documents))
    for i, doc in enumerate(documents):
      doc_time = parse_timestamp(doc.get("time"))
      if doc_time:
        age_hours = max(0.0, (ref_time - doc_time).total_seconds() / 3600.0)
        recency_scores[i] = np.exp(-age_hours / decay_hours)

    # 3. Likes scores (0 to 1, log-scaled so high likes don't drown out relevance)
    likes_array = np.array(
        [max(0, float(doc.get("like", 0) or 0)) for doc in documents]
    )
    if likes_array.max() > 0:
      like_scores = np.log1p(likes_array) / np.log1p(likes_array.max())
    else:
      like_scores = np.zeros(len(documents))

    # 4. Weighted final score (adjust weights as needed: must sum to 1.0)
    final_scores = (
        (0.75 * similarities) + (0.15 * recency_scores) + (0.10 * like_scores)
    )

    # Sort highest-to-lowest and take up to 5 (returns all if < 5)
    top_indices = np.argsort(final_scores)[::-1][:5]
    top_articles = [documents[idx] for idx in top_indices]

    return {"documents": top_articles}

  except Exception as e:
    return {"error": str(e)}, 500