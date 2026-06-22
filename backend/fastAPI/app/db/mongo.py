from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URI

mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client["video_synopsis"]
transcripts_collection = mongo_db["transcripts"]

# M6 — async client for the export engine (read-only)
async_mongo_client = AsyncIOMotorClient(MONGO_URI)
async_mongo_db = async_mongo_client["video_synopsis"]
synopses_collection = async_mongo_db["synopses"]
