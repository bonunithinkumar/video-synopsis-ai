import os
import tempfile
import logging
from celery import shared_task
from app.services.metadata_fetcher import get_video_metadata
from app.services.caption_fetcher import fetch_captions
from app.services.audio_pipeline import download_audio, convert_to_wav, cleanup_temp_files
from app.services.storage import upload_audio, upload_transcript, delete_object
from app.services.whisper_service import transcribe_audio
from app.core.config import settings
from app.db.mongo import transcripts_collection  # M5 bridge: write transcript so M5 can query by video_id


logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, acks_late=True)
def process_video_ingestion(self, video_url: str, video_id: str):
    scratch_dir = os.path.join(tempfile.gettempdir(), f"scratch_{video_id}")
    os.makedirs(scratch_dir, exist_ok=True)
    temp_files = []

    try:
        # Step 1: Fetch metadata
        self.update_state(state='FETCHING_METADATA', meta={'progress': 'Fetching video metadata'})
        metadata = get_video_metadata(video_id)

        # Step 2: Try to get existing captions from YouTube
        self.update_state(state='FETCHING_CAPTIONS', meta={'progress': 'Attempting to fetch captions'})
        captions = fetch_captions(video_id)

        s3_transcript_uri = None
        s3_audio_uri = None
        final_transcript_text = ""   # will be set in both paths below

        if captions:
            # --- PATH A: Captions found → store transcript text in S3/MinIO ---
            logger.info(f"Captions found for {video_id} ({len(captions)} chars). Uploading transcript to storage.")
            self.update_state(state='UPLOADING_TRANSCRIPT', meta={'progress': 'Uploading transcript to storage'})
            s3_transcript_uri = upload_transcript(captions, video_id)
            final_transcript_text = captions                          # M5 bridge: capture text
            logger.info(f"Transcript uploaded: {s3_transcript_uri}")
        else:
            # --- PATH B: No captions → download audio and store in S3/MinIO ---
            logger.info(f"No captions for {video_id}. Falling back to audio download.")
            self.update_state(state='DOWNLOADING_AUDIO', meta={'progress': 'Downloading audio track'})
            audio_path = download_audio(video_url, scratch_dir)
            temp_files.append(audio_path)

            self.update_state(state='CONVERTING_AUDIO', meta={'progress': 'Converting to 16kHz WAV'})
            wav_path = os.path.join(scratch_dir, f"{video_id}.wav")
            convert_to_wav(audio_path, wav_path)
            temp_files.append(wav_path)

            self.update_state(state='UPLOADING_AUDIO', meta={'progress': 'Uploading audio to storage'})
            s3_audio_uri = upload_audio(wav_path, video_id)
            logger.info(f"Audio uploaded: {s3_audio_uri}")

            # --- M4 work: Run Whisper transcription (small model), upload transcript, clean up audio ---
            self.update_state(state='TRANSCRIBING_AUDIO', meta={'progress': 'Transcribing audio using Whisper (M4 work)'})
            logger.info(f"[M4 work] Transcribing audio with Whisper for {video_id}")
            transcript_text = transcribe_audio(wav_path)
            final_transcript_text = transcript_text                   # M5 bridge: capture text
            
            logger.info(f"[M4 work] Uploading Whisper transcript to storage")
            s3_transcript_uri = upload_transcript(transcript_text, video_id)
            
            logger.info(f"[M4 work] Cleaning up/deleting audio file from storage")
            delete_object(settings.MINIO_BUCKET_NAME, f"audio/{video_id}.wav")
            s3_audio_uri = None # Set to None as it's deleted


        # Step 3: Write transcript to MongoDB so M5 can retrieve it by video_id
        # Both Path A (captions) and Path B (Whisper) converge here.
        self.update_state(state='SAVING_TO_DB', meta={'progress': 'Saving transcript to MongoDB (M5 bridge)'})
        try:
            transcripts_collection.update_one(
                {"video_id": video_id},
                {"$set": {
                    "video_id": video_id,
                    "transcript_text": final_transcript_text,
                    "source": "youtube_captions" if captions else "whisper",
                    "s3_transcript_uri": s3_transcript_uri,
                    "metadata": metadata,
                }},
                upsert=True   # Insert if not present, update if already exists
            )
            logger.info(f"[M5 bridge] Transcript saved to MongoDB for video_id: {video_id}")
        except Exception as db_exc:
            # Don't fail the whole task if MongoDB write fails — log and continue
            logger.warning(f"[M5 bridge] MongoDB write failed (non-fatal): {db_exc}")

        # Step 4: Complete
        self.update_state(state='COMPLETED', meta={'progress': 'Processing complete'})

        result = {
            "video_id": video_id,
            "metadata": metadata,
            "has_captions": bool(captions),
            "s3_transcript_uri": s3_transcript_uri,   # Populated when captions were found
            "s3_audio_uri": s3_audio_uri,              # Populated when audio was downloaded
        }

        logger.info(f"Processing complete for {video_id}: {result}")
        return result

    except Exception as exc:
        logger.error(f"Task failed for {video_id}: {exc}")
        self.retry(exc=exc, countdown=30)
    finally:
        cleanup_temp_files(temp_files)
        try:
            os.rmdir(scratch_dir)
        except OSError:
            pass
