from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.ingestion"]   # Updated path: tasks/ingestion.py (was worker/tasks.py in Phase A)
)

celery_app.conf.update(
    task_track_started=True,
    result_extended=True,
)

celery_app.set_default()
