# Module 1 → Connectivity Guide for M2, M4 & M5

**Written by:** Prudhvi (Module 1 — YouTube Ingestion)  
**For:** M2 (Frontend), M4 (AI/Transcription), M5 (AI Brain/LLM)  
**Service runs at:** `http://fastapi:8000` (inside Docker) / `http://localhost:8000` (local dev)

---

## What Module 1 Does (Quick Summary)

When a user submits a YouTube URL, Module 1:
1. Validates the URL and fetches video metadata (title, channel, duration, thumbnail)
2. Tries to get existing YouTube captions → if found, uploads the transcript text to storage
3. If no captions → downloads the audio track → converts to 16kHz WAV → uploads WAV to storage
4. All of this happens **asynchronously** via a Celery task running in the background

**Storage location of outputs:**
- Transcripts (when captions found): `s3://video-synopsis-audio/transcripts/{video_id}.txt`
- Audio WAV (when no captions): `s3://video-synopsis-audio/audio/{video_id}.wav`

---

---

# PART 1: For M2 — Frontend (Next.js / TypeScript)

## Overview

M2 builds the UI that the user interacts with. Everything the user does in the browser eventually calls Module 1's API. Here is the exact flow and how to call each endpoint.

---

## Step 1: URL Validation + Metadata Fetch

When the user types a YouTube URL into the input box and clicks "Validate" or "Check", call:

```
POST http://localhost:8000/api/v1/videos/validate
Content-Type: application/json

Body:
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Success Response (200):**
```json
{
  "title": "Rick Astley - Never Gonna Give You Up",
  "channel_name": "Rick Astley",
  "duration_seconds": 212,
  "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "has_captions": true,
  "captions_text": "We're no strangers to love..."
}
```

**Use this data to:**
- Show a preview card with the thumbnail, title, channel, and duration
- Show a "Captions available ✓" or "Audio only" badge
- Enable the "Generate Synopsis" button only after validation passes

**Error Responses:**
| HTTP Code | Meaning | Show to user |
|-----------|---------|--------------|
| 400 | Invalid YouTube URL | "Please enter a valid YouTube link" |
| 400 | Video too long | "Video exceeds 3-hour limit" |
| 403 | Private video | "This video is private" |
| 404 | Video not found | "Video not found on YouTube" |

---

## Step 2: Start the Ingestion Process

When the user clicks "Generate Synopsis", call:

```
POST http://localhost:8000/api/v1/videos/process
Content-Type: application/json

Body:
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Success Response (200):**
```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Save this `task_id`** — you will use it to poll for progress in Step 3.

---

## Step 3: Live Progress Tracking (WebSocket-style Polling)

> **Note:** Module 1 uses HTTP polling (not WebSocket). M2 must implement a polling loop using `setInterval` or a React `useEffect` until the task completes.

Poll every **2 seconds** using:

```
GET http://localhost:8000/api/v1/videos/status/{task_id}
```

**Response shape:**
```json
{
  "task_id": "a1b2c3d4-...",
  "state": "FETCHING_CAPTIONS",
  "progress": "Attempting to fetch captions",
  "result": null
}
```

**Possible `state` values — use these to update your progress bar:**

| State | What to show in UI |
|-------|--------------------|
| `PENDING` | "Queued..." |
| `FETCHING_METADATA` | "Fetching video info..." |
| `FETCHING_CAPTIONS` | "Looking for captions..." |
| `UPLOADING_TRANSCRIPT` | "Uploading transcript..." |
| `DOWNLOADING_AUDIO` | "Downloading audio..." |
| `CONVERTING_AUDIO` | "Processing audio..." |
| `UPLOADING_AUDIO` | "Uploading audio..." |
| `SUCCESS` | "Ready!" → stop polling, show synopsis |
| `FAILURE` | "Something went wrong" → show retry button |

**When `state === "SUCCESS"`, the `result` field contains:**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "metadata": { "title": "...", "channel_name": "...", ... },
  "has_captions": true,
  "s3_transcript_uri": "s3://video-synopsis-audio/transcripts/dQw4w9WgXcQ.txt",
  "s3_audio_uri": null
}
```

Pass this `result` forward to whatever service generates the synopsis (M5's API).

---

## M2 TypeScript Types (Copy-paste ready)

```typescript
// Request
interface VideoRequest {
  url: string;
}

// Validate response
interface VideoMetadataResponse {
  title: string;
  channel_name: string;
  duration_seconds: number;
  thumbnail_url: string;
  has_captions: boolean;
  captions_text: string | null;
}

// Process response
interface ProcessResponse {
  task_id: string;
}

// Status poll response
interface TaskStatusResponse {
  task_id: string;
  state: string;
  progress: string | null;
  result: IngestionResult | null;
}

interface IngestionResult {
  video_id: string;
  metadata: VideoMetadataResponse;
  has_captions: boolean;
  s3_transcript_uri: string | null;
  s3_audio_uri: string | null;
}
```

---

## Environment Variable for M2

In your `.env` (Vite), use:
```
VITE_AI_API_URL=http://localhost:8000
```
This is already in `.env.example` — just make sure your `fetch` calls use `import.meta.env.VITE_AI_API_URL`.

---

---

# PART 2: For M4 — AI / Transcription (Whisper + MongoDB)

> [!IMPORTANT]
> **INTEGRATION UPDATE (M4 Work):** M4 has been integrated directly into M3's Celery task flow within this backend. Whisper transcription is now executed inline as part of the ingestion task, MongoDB storage has been removed, and transcribed text is uploaded directly to MinIO while raw audio is deleted. Please refer to [M4CONNECTIVITY.md](file:///C:/Users/VIGNAN/video_synopsis/video-synopsis-ai/M4CONNECTIVITY.md) for the current active configuration.

## Overview


M4's job is to **convert audio to text** using Whisper. Module 1 has already done the hard work of:
- Deciding whether audio or text is needed
- Downloading and storing the audio as a clean 16kHz WAV
- Uploading it to S3/MinIO at a predictable path

M4 picks up from where Module 1 leaves off.

---

## When Does M4 Get Involved?

M4 is needed **only when `s3_audio_uri` is not null** in the ingestion result.

```
If result.s3_audio_uri is not null:
    → M4 must transcribe this audio using Whisper
    → Store the transcript in MongoDB

If result.s3_transcript_uri is not null:
    → Text already exists, skip Whisper
    → M4 can optionally clean/normalise the text
    → Store in MongoDB
```

---

## How to Get the Audio File

The audio WAV file is stored in MinIO/S3 at:
```
s3://video-synopsis-audio/audio/{video_id}.wav
```

**To download it in Python using boto3:**
```python
import boto3
import os

s3 = boto3.client(
    's3',
    endpoint_url=os.environ.get("MINIO_URL", "http://localhost:9000"),
    aws_access_key_id=os.environ.get("MINIO_ROOT_USER", "admin"),
    aws_secret_access_key=os.environ.get("MINIO_ROOT_PASSWORD", "password123"),
)

# Download audio file
s3.download_file(
    Bucket="video-synopsis-audio",
    Key=f"audio/{video_id}.wav",
    Filename=f"/tmp/{video_id}.wav"
)

# Now pass /tmp/{video_id}.wav to Whisper API
```

> **Important:** The WAV file is already 16kHz mono — exactly the format Whisper expects. No pre-processing needed.

---

## Audio File Specs (What Module 1 guarantees)

| Property | Value |
|----------|-------|
| Format | WAV |
| Sample rate | 16,000 Hz (16kHz) |
| Channels | 1 (Mono) |
| Codec | PCM |
| Naming | `audio/{video_id}.wav` |

---

## How to Get the Transcript (When Captions Exist)

If `s3_transcript_uri` is not null, M4 can read the raw caption text directly:

```python
import boto3, os

s3 = boto3.client('s3', endpoint_url="http://localhost:9000",
                  aws_access_key_id="admin", aws_secret_access_key="password123")

response = s3.get_object(Bucket="video-synopsis-audio", Key=f"transcripts/{video_id}.txt")
raw_text = response['Body'].read().decode('utf-8')

# Clean / normalise raw_text, then store in MongoDB
```

---

## M4 Celery Task Integration

M4 likely has its own Celery task for Whisper transcription. Here is how to chain it with Module 1's task:

```python
# Option A: Chain tasks (M1 → M4 automatically)
from app.tasks.ingestion import process_video_ingestion
from m4_app.tasks.transcription import transcribe_audio  # M4's task

result = process_video_ingestion.apply_async(
    args=[video_url, video_id],
    link=transcribe_audio.s(video_id)   # M4's task runs after M1 completes
)

# Option B: M4 polls M1's result independently
# M1 returns s3_audio_uri in the task result
# M4 reads that and starts Whisper on the file
```

---

## MongoDB Storage (M4's Responsibility)

After transcription, M4 should store in MongoDB with this structure so M5 can find it:

```json
{
  "_id": "dQw4w9WgXcQ",
  "video_id": "dQw4w9WgXcQ",
  "transcript_text": "Full cleaned transcript here...",
  "source": "whisper",           // or "youtube_captions"
  "language": "en",
  "created_at": "2026-06-18T16:00:00Z",
  "metadata": {
    "title": "...",
    "channel_name": "...",
    "duration_seconds": 212
  }
}
```

---

---

# PART 3: For M5 — AI Brain (GPT-4o Summarization)

## Overview

M5 receives the **cleaned transcript text** (either from M4's Whisper output or from Module 1's caption text) and generates the structured synopsis using GPT-4o.

---

## What M5 Receives

M5 should read from **MongoDB** (written by M4) — not directly from Module 1's API. The flow is:

```
Module 1 → Storage (S3/MinIO) → M4 (Whisper) → MongoDB → M5 (GPT-4o)
```

The MongoDB document M5 reads from is the one M4 writes (see M4 section above).

---

## Key Fields M5 Needs from the MongoDB Document

```python
doc = mongo_db.transcripts.find_one({"video_id": video_id})

transcript_text = doc["transcript_text"]    # Full text to summarise
duration_seconds = doc["metadata"]["duration_seconds"]  # For chunking decisions
title = doc["metadata"]["title"]            # For prompt context
channel_name = doc["metadata"]["channel_name"]  # For prompt context
```

---

## Token Counting & Chunking Context

Module 1 stores metadata including `duration_seconds`. Use this as a proxy for transcript length when deciding your Map-Reduce chunking strategy:

| Duration | Approximate tokens | Strategy |
|----------|-------------------|----------|
| < 10 min | < 4,000 tokens | Single GPT-4o call |
| 10–60 min | 4,000–30,000 tokens | Map-Reduce chunking |
| 60–180 min | 30,000–90,000 tokens | Aggressive chunking |

---

## The `has_captions` Flag — Why It Matters for M5

Module 1's ingestion result includes `has_captions: bool`. This matters for M5's prompt:

```python
if has_captions:
    system_prompt = "You are summarising a YouTube video transcript from auto-generated captions. 
                     The text may have minor errors — account for this in your summary."
else:
    system_prompt = "You are summarising a YouTube video transcript from Whisper speech-to-text. 
                     The text may have formatting differences — account for this in your summary."
```

---

## Full Data Flow Diagram

```
User submits URL (Frontend / M2)
         │
         ▼
POST /api/v1/videos/process (Module 1 FastAPI)
         │
         ▼
Celery Task: process_video_ingestion
         │
    ┌────┴────┐
    │         │
Captions   No Captions
found?     found?
    │         │
    ▼         ▼
Upload     Download audio (yt-dlp)
transcript    │
to MinIO   Convert to 16kHz WAV (ffmpeg)
    │         │
    │      Upload WAV to MinIO
    │         │
    └────┬────┘
         │
         ▼
    Task result:
    {s3_transcript_uri, s3_audio_uri, metadata}
         │
         ▼
M4 reads from MinIO → Runs Whisper (if audio) → Writes to MongoDB
         │
         ▼
M5 reads from MongoDB → GPT-4o summarisation → Returns structured synopsis
         │
         ▼
M2 (Frontend) displays synopsis to user
```

---

## Quick Reference: All Module 1 API Endpoints

| Endpoint | Method | Purpose | Called by |
|----------|--------|---------|-----------|
| `/api/v1/videos/validate` | POST | Validate URL + get metadata | M2 (URL input form) |
| `/api/v1/videos/process` | POST | Start async ingestion task | M2 (Generate button) |
| `/api/v1/videos/status/{task_id}` | GET | Poll task progress | M2 (progress tracker) |
| `/health` | GET | Service health check | Docker / M1 DevOps |

---

## Questions?

Reach out to **Prudhvi (Module 1)** with the video ID and task ID for any debugging.
All task logs are visible in the Celery worker output (`docker-compose logs fastapi`).
