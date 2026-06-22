from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    YOUTUBE_API_KEY: str = "YOUR_YOUTUBE_API_KEY"
    REDIS_URL: str = "redis://localhost:6379/0"

    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_SECURE: bool = False
    MINIO_BUCKET_NAME: str = "video-synopsis-audio"

    MAX_VIDEO_DURATION_MINUTES: int = 180

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# M-5
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
REDIS_URI = os.environ.get("REDIS_URI", "redis://localhost:6379/0")


settings = Settings()
