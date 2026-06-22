from pymongo import MongoClient
from app.core.config import MONGO_URI

mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client["video_synopsis"]
transcripts_collection = mongo_db["transcripts"]
