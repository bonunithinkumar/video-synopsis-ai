from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.videos import router as video_router
from app.services.storage import ensure_bucket_exists
from app.core.config import settings

# M-5
from app.api.synopsis import router as synopsis_router

# M-6
from app.api.export import router as export_router

app = FastAPI(title="YouTube Ingestion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    ensure_bucket_exists(settings.MINIO_BUCKET_NAME)

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(video_router, prefix="/api/v1/videos", tags=["videos"])


# M-5
app.include_router(synopsis_router, prefix="/api/v1/synopsis", tags=["Synopsis"])

# M-6
app.include_router(export_router, prefix="/api/v1/export", tags=["Export"])