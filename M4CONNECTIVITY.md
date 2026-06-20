# M4 to M3 Connectivity Guide (AI / Transcription Module)

**Author:** Antigravity (AI Pair Programmer)  
**Context:** Module 4 — OpenAI Whisper Transcription Integration  
**Target Repository:** `video-synopsis-ai` (Module 3/Module 1)

---

## 1. Overview

Module 4 (M4) handles speech-to-text transcription using **OpenAI Whisper (small model)**. 

Initially, M4 was designed as an independent Celery consumer storing transcripts in MongoDB. To simplify the architecture, M4 has been integrated directly into M3's FastAPI backend and Celery workflow. 

All transcripts (whether from YouTube captions or Whisper transcription) are stored in **MinIO/S3**, and the raw audio WAV files are deleted after successful transcription. **No MongoDB is used.**

---

## 2. Updated Data Flow

```
                  User submits URL (M2 Frontend)
                               │
                               ▼
               POST /api/v1/videos/process (FastAPI)
                               │
                               ▼
                 Celery: process_video_ingestion
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
     Captions Found?                      No Captions Found?
    [PATH A: Captions]                     [PATH B: Audio Only]
            │                                     │
    Upload transcript to                  Download audio track
    MinIO (transcripts/)                   Convert to 16kHz WAV
            │                             Upload WAV to MinIO
            │                                     │
            │                             ┌───────▼───────┐
            │                             │   M4 WORK     │
            │                             │               │
            │                             │ Run Whisper   │
            │                             │ (small model) │
            │                             │               │
            │                             │ Upload text to│
            │                             │ transcripts/  │
            │                             │               │
            │                             │ Delete audio  │
            │                             │ from MinIO    │
            │                             └───────┬───────┘
            │                                     │
            └──────────────────┬──────────────────┘
                               │
                               ▼
           Ingestion completed result payload:
           - s3_transcript_uri: "s3://.../transcripts/{video_id}.txt"
           - s3_audio_uri: null (deleted)
```

---

## 3. Code Integration Details

The following files were modified/added to connect M4 with M3:

### A. New Service: [whisper_service.py](file:///C:/Users/VIGNAN/video_synopsis/video-synopsis-ai/backend/fastAPI/app/services/whisper_service.py)
* Lazily loads the Whisper **`small`** model (cached in memory as `_model`).
* Leverages CUDA GPU if available, falling back to CPU.
* Transcribes local WAV files directly.

### B. Updated Service: [storage.py](file:///C:/Users/VIGNAN/video_synopsis/video-synopsis-ai/backend/fastAPI/app/services/storage.py)
* Added a `delete_object(bucket_name, object_key)` helper function to remove files from S3/MinIO.

### C. Updated Task: [ingestion.py](file:///C:/Users/VIGNAN/video_synopsis/video-synopsis-ai/backend/fastAPI/app/tasks/ingestion.py)
* **Path B (No Captions)** now performs transcription inline inside the Celery worker:
  1. Downloads and converts the audio track to local WAV.
  2. Uploads the audio WAV to MinIO (generates initial `s3_audio_uri`).
  3. Transcribes the local WAV file using the cached Whisper `small` model.
  4. Uploads the transcribed text to MinIO at `transcripts/{video_id}.txt`.
  5. Deletes the audio WAV file from MinIO.
  6. Returns `s3_transcript_uri` and sets `s3_audio_uri = None` to signify audio cleanup.

---

## 4. Dependencies & Infrastructure Updates

* **`requirements.txt`**: Added `openai-whisper` (which pulls in `torch` and dependencies).
* **`Dockerfile`**: Installed `git` in the container to support installing Git-based PyPI dependencies.

---

## 5. Verification Checklist

To verify that M4 is running correctly in the integrated environment:
1. Build the updated Docker images:
   ```bash
   docker-compose build fastapi
   ```
2. Start the services:
   ```bash
   docker-compose up -d
   ```
3. Submit a YouTube URL that does NOT have captions (e.g. music/instrumental or raw speech videos).
4. Monitor the FastAPI container logs:
   ```bash
   docker-compose logs -f fastapi
   ```
5. Confirm that the task state transitions through:
   `DOWNLOADING_AUDIO` ➔ `CONVERTING_AUDIO` ➔ `UPLOADING_AUDIO` ➔ `TRANSCRIBING_AUDIO` ➔ `COMPLETED`
6. Check that the final task result contains a valid `s3_transcript_uri` and `s3_audio_uri` is `null`.
7. Verify that the transcript text is readable in the MinIO browser under the `transcripts/` path in the `video-synopsis-audio` bucket, and that the `audio/` path is empty.
