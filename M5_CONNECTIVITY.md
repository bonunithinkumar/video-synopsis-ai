# M5 to M3/M4 Connectivity Guide (AI Summarization Engine)

**Author:** Module 5 Engineer  
**Context:** Module 5 — Groq AI Summarization Engine Integration  
**Target Repository:** `video-synopsis-ai` (FastAPI backend)

---

## 1. Overview

Module 5 (M5) handles taking a cleaned transcript and generating a highly structured, consistent JSON synopsis using **Groq (`llama-3.3-70b-versatile`)**.

Initially designed as a separate downstream service, M5 has been integrated directly into the M3 FastAPI backend. It enforces a strict JSON schema output and employs a Map-Reduce chunking strategy constrained by Groq's Tokens Per Minute (TPM) limits to handle arbitrarily long videos.

---

## 2. Updated Data Flow

```text
                  User submits URL (M2 Frontend)
                               │
                               ▼
               Ingestion & Transcription (M1 & M4)
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
     Transcript text generated and stored in MongoDB `transcripts` collection
                               │
                               ▼
               POST /api/v1/synopsis/summary/mongo/{video_id}
                               │
                               ▼
               M5: Sanitize Transcript & Count Tokens
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
       <= 4500 tokens                        > 4500 tokens
      [Single-Pass]                          [Map-Reduce]
            │                                     │
            │                          Split into 4000 token chunks
            │                                     │
            │                          Groq API Map Phase (Summarize parts)
            │                                     │
            │                          Groq API Reduce Phase (Combine)
            │                                     │
            └──────────────────┬──────────────────┘
                               │
                               ▼
                  Groq API returns Strict JSON Synopsis
                               │
                               ▼
               (Optional: Dispatch to Celery PDF Generation)
                               │
                               ▼
                 Returns JSON Synopsis Payload to UI
```

---

## 3. Code Integration Details

The following files were modified/added to connect M5 with the M3 FastAPI backend:

### A. New API Endpoints: `app/api/synopsis.py`
* Registers `/api/v1/synopsis/summary` for direct text ingestion.
* Registers `/api/v1/synopsis/summary/mongo/{video_id}` to retrieve from MongoDB.

### B. Core Services:
* **`app/services/summarizer.py`**: Orchestrates `Single-Pass` vs `Map-Reduce` chunking logic.
* **`app/services/llm_service.py`**: Interacts with the Groq API and handles token limit truncations (`HTTP 502`).
* **`app/services/chunking.py`**: Uses `tiktoken` to split long transcripts into overlapping chunks.
* **`app/services/sanitization.py`**: Pre-processes text (removes zero-width characters, collapses spaces) and securely extracts raw JSON from markdown fences.

### C. Constants & Config:
* **`app/core/constants.py`**: Contains the strict `SYNOPSIS_SYSTEM_PROMPT`, map-reduce templates, and token limits (`SAFE_LIMIT = 4500`).
* **`app/schemas/transcript.py`**: Defines Pydantic validation models for input requests.
* **`app/db/mongo.py`**: Establishes connection to the MongoDB `transcripts` collection.

---

## 4. API Endpoints & Expected Results

### Endpoint: MongoDB Trigger
```http
POST /api/v1/synopsis/summary/mongo/{video_id}
```
**Behavior:** Fetches the transcript from MongoDB, sanitizes it, summarizes it via Groq, and returns the strict JSON structure.

### Endpoint: Direct Payload (For Testing)
```http
POST /api/v1/synopsis/summary
Content-Type: application/json

{
  "video_url": "https://youtube.com/watch?v=...",
  "video_title": "Example Video",
  "text": "Full transcript text goes here..."
}
```

### Strict JSON Output Result
M5 guarantees exactly one complete, parseable JSON object adhering to this schema:
```json
{
  "basic_summary": {
    "overall_synopsis": "150–250 word overview..."
  },
  "topics_covered": {
    "title": "Short label",
    "topics": ["Topic 1", "Topic 2"]
  },
  "detailed_summary": {
    "key_insights": ["Non-obvious takeaway."],
    "action_items": ["Concrete action."],
    "topic_breakdown": [
      {
        "topic": "Topic 1",
        "explanation": "100–180 words matching speaker tone."
      }
    ]
  },
  "closing_note": "1-2 sentences in speaker's voice."
}
```

---

## 5. Dependencies & Infrastructure Updates

* **`requirements.txt`**: Added `groq`, `tiktoken`, `pymongo`, `python-dotenv`, and `openai-whisper`.
* **`.env`**: Requires three new variables:
  * `GROQ_API_KEY=your_groq_api_key_here`
  * `MONGO_URI=mongodb://localhost:27017`
  * `REDIS_URI=redis://localhost:6379/0`
* **`app/main.py`**: Modified to include the `synopsis_router` under `/api/v1/synopsis`.
* **`app/core/config.py`**: Modified to source the new `.env` variables cleanly.

---

## 6. Verification Checklist

To verify that M5 is running correctly:
1. Ensure your `.env` contains a valid `GROQ_API_KEY` and the `MONGO_URI` is correct.
2. Build and start the services:
   ```bash
   docker-compose build fastapi
   docker-compose up -d
   ```
3. Test the direct payload endpoint using `curl` or Postman:
   ```bash
   curl -X POST http://localhost:8000/api/v1/synopsis/summary \
   -H "Content-Type: application/json" \
   -d '{"video_url": "https://test", "video_title": "Test", "text": "This is a short test transcript to ensure the summarizer works."}'
   ```
4. Verify the output is a perfectly structured JSON object conforming to the exact schema.
