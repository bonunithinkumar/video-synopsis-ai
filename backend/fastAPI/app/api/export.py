# M6 — Document Export API routes
# Production: GET /{synopsis_id}/download?format=pdf|docx  (reads from MongoDB)
# Testing:    POST /pdf, POST /docx                        (accepts raw JSON)

import os

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from bson import ObjectId
from bson.errors import InvalidId

from app.schemas.export import SynopsisInput
from app.services.export_service import render_pdf, render_docx, cleanup_file
from app.db.mongo import synopses_collection

router = APIRouter()


async def _fetch_synopsis(synopsis_id: str) -> SynopsisInput:
    """Pull the raw document from MongoDB and validate it into our schema."""
    try:
        object_id = ObjectId(synopsis_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid synopsis id format.")

    raw_doc = await synopses_collection.find_one({"_id": object_id})
    if raw_doc is None:
        raise HTTPException(status_code=404, detail="Synopsis not found.")

    raw_doc.pop("_id", None)
    try:
        return SynopsisInput(**raw_doc)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Stored synopsis is malformed and cannot be exported: {exc}",
        )


# ---- Production route (MongoDB-backed) ------------------------------------

@router.get("/{synopsis_id}/download")
async def download_synopsis(
    synopsis_id: str,
    format: str,
    background_tasks: BackgroundTasks,
):
    if format not in ("pdf", "docx"):
        raise HTTPException(status_code=400, detail="format must be 'pdf' or 'docx'.")

    data = await _fetch_synopsis(synopsis_id)

    if format == "pdf":
        file_path = render_pdf(data)
        media_type = "application/pdf"
    else:
        file_path = render_docx(data)
        media_type = (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )

    background_tasks.add_task(cleanup_file, file_path)
    return FileResponse(
        file_path,
        media_type=media_type,
        filename=os.path.basename(file_path),
        background=background_tasks,
    )


# ---- Testing routes (no DB needed) ----------------------------------------

@router.post("/pdf")
def export_pdf(data: SynopsisInput, background_tasks: BackgroundTasks):
    file_path = render_pdf(data)
    background_tasks.add_task(cleanup_file, file_path)
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=os.path.basename(file_path),
        background=background_tasks,
    )


@router.post("/docx")
def export_docx(data: SynopsisInput, background_tasks: BackgroundTasks):
    file_path = render_docx(data)
    background_tasks.add_task(cleanup_file, file_path)
    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=os.path.basename(file_path),
        background=background_tasks,
    )
