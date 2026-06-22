# Module 1 — YouTube Ingestion: Modifications to `video-synopsis-ai` Repository

**Author:** Prudhvi (Module 1 — YouTube Ingestion Engineer)  
**Date:** June 2026  
**Branch:** `main`

---

## Overview

The `backend/fastAPI/` directory was a skeleton (only a 3-line Dockerfile that ran `bash` and exited).
This document describes every file that was added or modified, and the exact reason behind each decision.

---

## Files Modified

### 1. `backend/fastAPI/Dockerfile`

**Before:**
```dockerfile
FROM python:3.12
WORKDIR /app
CMD ["bash"]
```

**After:**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Why:**
- `python:3.12-slim` is smaller and faster to build than `python:3.12`
- `ffmpeg` is a **system-level binary** (not a Python package) used by `audio_pipeline.py` to convert downloaded audio to 16kHz WAV format. Without this line, the audio conversion step crashes silently inside the container even though it works perfectly on local machines where ffmpeg is pre-installed.
- Added `requirements.txt` install and `uvicorn` startup — the service needs a real entrypoint, not `bash`.

---

### 2. `docker-compose.yaml`

**Before:** The `fastapi:` service block existed but was entirely commented out.

**After:** Uncommented and completed with:
```yaml
fastapi:
  build: ./backend/fastAPI
  ports:
    - "8000:8000"
  env_file: .env
  environment:
    - REDIS_URL=redis://redis:6379/0
    - MINIO_ENDPOINT=minio:9000
    - MINIO_ACCESS_KEY=admin
    - MINIO_SECRET_KEY=password123
    - MINIO_SECURE=false
    - MINIO_BUCKET_NAME=video-synopsis-audio
  depends_on:
    - postgres
    - redis
    - minio
```

**Why:**
- The service was always intended to run — it just wasn't activated yet.
- `MINIO_ENDPOINT=minio:9000` uses Docker's internal service name (`minio`) — not `localhost`. Inside Docker networks, containers talk to each other by service name, not by `localhost`.
- `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` are set to match the credentials already defined in the `minio:` service block (`admin` / `password123`). This prevents a connection-refused error at startup.
- `depends_on` ensures Redis and MinIO are ready before FastAPI tries to connect.

---

### 3. `.env.example`

**Added at the bottom:**
```env
YOUTUBE_API_KEY=your_youtube_api_key_here
MAX_VIDEO_DURATION_MINUTES=180
```

**Why:**
- `YOUTUBE_API_KEY` is required by `metadata_fetcher.py` to call the YouTube Data API v3 and retrieve video title, duration, and thumbnail. Without a real key, the service falls back to mock data.
- `MAX_VIDEO_DURATION_MINUTES` controls how long a video can be before the API rejects it (default 180 minutes = 3 hours). Configurable per deployment environment.
- Note: `MINIO_*` and `REDIS_URL` are already present in the file — no duplication needed.

---

## Files Added (New)

### `backend/fastAPI/requirements.txt`
All Python dependencies for the ingestion service. Excludes `pytest` and `httpx` (test-only tools, not needed in the production Docker image).

---

### `backend/fastAPI/app/main.py`
FastAPI application entry point. Registers the video ingestion router at `/api/v1/videos` and runs a startup check to ensure the S3/MinIO storage bucket exists before accepting requests.

---

### `backend/fastAPI/app/core/config.py`
Pydantic `Settings` class that reads all environment variables. Uses `extra="ignore"` so it safely ignores any env vars it doesn't know about (like `OPENAI_API_KEY` or `JWT_SECRET` from other modules).

---

### `backend/fastAPI/app/core/celery_app.py`
Celery configuration pointing to Redis as both broker and result backend. The `include` path points to `app.tasks.ingestion` — the location of the Celery task in the M1 monorepo structure.

---

### `backend/fastAPI/app/api/videos.py`
REST API router with three endpoints:
- `POST /validate` — validates a YouTube URL and returns video metadata
- `POST /process` — kicks off an async Celery ingestion task
- `GET /status/{task_id}` — polls the real-time status of a running task

---

### `backend/fastAPI/app/schemas/video.py`
Pydantic models defining the exact shape of all API request and response payloads. Enforces type safety across the service boundary.

---

### `backend/fastAPI/app/services/audio_pipeline.py`
Downloads audio from YouTube using `yt-dlp` and converts it to 16kHz mono WAV using `ffmpeg` via subprocess. Used only when a video has no captions available.

---

### `backend/fastAPI/app/services/caption_fetcher.py`
Fetches YouTube auto-generated or manual captions using `youtube-transcript-api`. Tries English first, falls back to any available language. Returns `None` if no captions exist (triggering the audio download path).

---

### `backend/fastAPI/app/services/metadata_fetcher.py`
Calls YouTube Data API v3 to fetch video title, channel name, duration, and thumbnail. Rejects private videos and videos exceeding the configured duration limit. Returns mock data when no API key is set (useful for local testing without a quota).

---

### `backend/fastAPI/app/services/storage.py`
S3-compatible storage client using `boto3`. Works with **both** local MinIO (development) and real AWS S3 (production) — only the env vars change, not the code. Stores audio at `audio/{video_id}.wav` and transcripts at `transcripts/{video_id}.txt`.

---

### `backend/fastAPI/app/services/url_validator.py`
Regex-based YouTube URL validator supporting all URL formats: standard, short (`youtu.be`), mobile, embed, and Shorts. Extracts the 11-character video ID from any valid YouTube link.

---

### `backend/fastAPI/app/tasks/ingestion.py`
The core Celery task `process_video_ingestion`. Runs asynchronously and follows this logic:
1. Fetch video metadata
2. Try to get captions → if found, upload transcript text to storage
3. If no captions → download audio → convert to WAV → upload WAV to storage
4. Return a result object containing metadata, storage URIs, and task state

Retries automatically up to 3 times with a 30-second delay on failure.

---

## Summary Table

| File | Action | Reason |
|------|--------|--------|
| `backend/fastAPI/Dockerfile` | Modified | Added ffmpeg install + proper uvicorn startup |
| `docker-compose.yaml` | Modified | Activated fastapi service with correct env + depends_on |
| `.env.example` | Modified | Added YOUTUBE_API_KEY and MAX_VIDEO_DURATION_MINUTES |
| `backend/fastAPI/requirements.txt` | New | Python dependencies for production image |
| `backend/fastAPI/app/main.py` | New | FastAPI app entry point |
| `backend/fastAPI/app/core/config.py` | New | Env var configuration |
| `backend/fastAPI/app/core/celery_app.py` | New | Celery broker setup |
| `backend/fastAPI/app/api/videos.py` | New | REST API router (3 endpoints) |
| `backend/fastAPI/app/schemas/video.py` | New | Request/response Pydantic models |
| `backend/fastAPI/app/services/audio_pipeline.py` | New | Audio download + WAV conversion |
| `backend/fastAPI/app/services/caption_fetcher.py` | New | YouTube caption retrieval |
| `backend/fastAPI/app/services/metadata_fetcher.py` | New | YouTube Data API v3 metadata fetch |
| `backend/fastAPI/app/services/storage.py` | New | S3/MinIO upload service |
| `backend/fastAPI/app/services/url_validator.py` | New | YouTube URL parsing + validation |
| `backend/fastAPI/app/tasks/ingestion.py` | New | Async Celery ingestion task |

---

## Module 5 — Files Added (New)

### `backend/fastAPI/app/api/synopsis.py`
REST API router for M5 exposing two endpoints:
- `POST /api/v1/synopsis/summary` — For direct payload testing.
- `POST /api/v1/synopsis/summary/mongo/{video_id}` — To fetch a transcript from MongoDB and summarize it.

---

### `backend/fastAPI/app/schemas/transcript.py`
Pydantic models defining the request payload shape for direct summary requests. Ensures type safety across the service boundary.

---

### `backend/fastAPI/app/core/constants.py`
Houses the prompt logic and chunking constraints:
- `SYNOPSIS_SYSTEM_PROMPT`: The strict prompt enforcing the JSON structure and tone rules.
- `MAP_PROMPT_TEMPLATE` & `REDUCE_PREAMBLE`: Templates used during chunking.
- `SAFE_LIMIT`, `CHUNK_SIZE`, `CHUNK_OVERLAP`: Token bounds corresponding to Groq rate limits.

---

### `backend/fastAPI/app/db/mongo.py`
Simple MongoDB connection client. Exposes `transcripts_collection` for M5 to pull the raw text output from M4.

---

### `backend/fastAPI/app/services/chunking.py`
Token counting and text chunking logic using `tiktoken`. Ensures long transcripts are broken cleanly so they don't exceed Groq API limits.

---

### `backend/fastAPI/app/services/llm_service.py`
Centralized integration with the Groq API (`llama-3.3-70b-versatile`). Includes error handling for token truncations (`HTTP 502`).

---

### `backend/fastAPI/app/services/sanitization.py`
Data cleaning routines:
- `sanitize_transcript`: Removes zero-width characters, normalizes quotes, and collapses duplicate words.
- `extract_json`: A robust extractor that strips out markdown fences (```json) returned by the LLM.

---

### `backend/fastAPI/app/services/summarizer.py`
The orchestration layer. Decides between `summarize_single` (short videos) and `summarize_map_reduce` (long videos) based on token counts.

---

## Module 5 — Files Modified

### `backend/fastAPI/app/main.py`
**Action:** Included `synopsis_router` in the main FastAPI application tree with prefix `/api/v1/synopsis`.

---

### `backend/fastAPI/app/core/config.py`
**Action:** Added `python-dotenv` loader to ingest `GROQ_API_KEY`, `MONGO_URI`, and `REDIS_URI` from the environment.

---

### `backend/fastAPI/requirements.txt`
**Action:** Appended M5 specific dependencies: `groq`, `tiktoken`, `pymongo`, `python-dotenv`, and `openai-whisper`.

---

## Module 5 — Summary Table

| File | Action | Reason |
|------|--------|--------|
| `backend/fastAPI/app/api/synopsis.py` | New | REST API endpoints for JSON summarization |
| `backend/fastAPI/app/schemas/transcript.py` | New | Request schemas for synopsis inputs |
| `backend/fastAPI/app/core/constants.py` | New | System prompts, token limits, templates |
| `backend/fastAPI/app/db/mongo.py` | New | MongoDB connection for transcript retrieval |
| `backend/fastAPI/app/services/chunking.py` | New | Text chunking for Map-Reduce flow |
| `backend/fastAPI/app/services/llm_service.py` | New | Groq API interaction logic |
| `backend/fastAPI/app/services/sanitization.py` | New | Input text cleaning & JSON fence stripping |
| `backend/fastAPI/app/services/summarizer.py` | New | Single-pass and Map-Reduce orchestrator |
| `backend/fastAPI/app/main.py` | Modified | Registered `/api/v1/synopsis` router |
| `backend/fastAPI/app/core/config.py` | Modified | Imported Groq and Mongo ENV variables |
| `backend/fastAPI/requirements.txt` | Modified | Added Groq, Tiktoken, PyMongo dependencies |
