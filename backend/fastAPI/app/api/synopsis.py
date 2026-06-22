import json
from fastapi import APIRouter, HTTPException

from app.schemas.transcript import Transcript
from app.core.constants import SAFE_LIMIT
from app.services.sanitization import sanitize_transcript, extract_json
from app.services.chunking import count_tokens
from app.services.summarizer import summarize_single, summarize_map_reduce
# from app.workers.tasks import generate_pdf
from app.db.mongo import transcripts_collection

router = APIRouter()

@router.get("/")
def greet():
    return {"status": "ok", "message": "Synopsis AI Engine is running"}

@router.post("/summary")
def summarize(transcript: Transcript):
    cleaned_text = sanitize_transcript(transcript.text)
    token_count = count_tokens(cleaned_text)

    print(f"[INFO] Transcript received: {token_count} tokens")

    if token_count <= SAFE_LIMIT:
        print("[INFO] Short transcript — single-pass summarization")
        summary_text = summarize_single(
            transcript.video_url, transcript.video_title, cleaned_text
        )
    else:
        print(f"[INFO] Long transcript ({token_count} tokens) — triggering Map-Reduce")
        summary_text = summarize_map_reduce(
            transcript.video_url, transcript.video_title, cleaned_text
        )

    # Clean and parse the LLM response into JSON
    cleaned_text = extract_json(summary_text)
    try:
        summary_json = json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=502,
            detail=f"LLM returned invalid JSON: {e}. Raw snippet: {summary_text[:300]}"
        )

    response_json = {
        "video_metadata": {
            "title": transcript.video_title,
            "video_url": transcript.video_url
        },
        "summary": summary_json,
    }
    # generate_pdf.delay(response_json)
    return response_json

@router.post("/summary/mongo/{video_id}")
def summarize_from_mongo(video_id: str):
    doc = transcripts_collection.find_one(
        {"video_id": video_id}
    )

    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Transcript not found"
        )

    transcript_text = doc["transcript_text"]
    title = doc["metadata"]["title"]

    cleaned_text = sanitize_transcript(transcript_text)
    token_count = count_tokens(cleaned_text)

    if token_count <= SAFE_LIMIT:
        summary_text = summarize_single(
            "",
            title,
            cleaned_text
        )
    else:
        summary_text = summarize_map_reduce(
            "",
            title,
            cleaned_text
        )

    cleaned_json = extract_json(summary_text)

    return json.loads(cleaned_json)
