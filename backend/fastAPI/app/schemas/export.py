# M6 — Pydantic schemas for the Document Export Engine
# Mirrors the exact JSON shape that Module 5's AI summarization produces.

from typing import List, Optional
from pydantic import BaseModel, Field, model_validator

class VideoMetadataExport(BaseModel):
    title: str
    video_url: Optional[str] = None
    video_id: Optional[str] = None
    channel_name: Optional[str] = None
    thumbnail_url: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def populate_video_url(cls, data: dict) -> dict:
        if isinstance(data, dict):
            # If video_url is missing but video_id is present, build the URL
            if not data.get("video_url") and data.get("video_id"):
                data["video_url"] = f"https://www.youtube.com/watch?v={data['video_id']}"
            # Safe fallback if both are missing
            if not data.get("video_url"):
                data["video_url"] = "https://www.youtube.com"
        return data


class BasicSummary(BaseModel):
    overall_synopsis: str


class TopicsCovered(BaseModel):
    title: str
    topics: List[str] = Field(default_factory=list)


class TopicBreakdownItem(BaseModel):
    topic: str
    explanation: str


class DetailedSummary(BaseModel):
    key_insights: List[str] = Field(default_factory=list)
    action_items: List[str] = Field(default_factory=list)
    topic_breakdown: List[TopicBreakdownItem] = Field(default_factory=list)


class SummaryBlock(BaseModel):
    basic_summary: BasicSummary
    topics_covered: TopicsCovered
    detailed_summary: DetailedSummary
    closing_note: str


class SynopsisInput(BaseModel):
    video_metadata: VideoMetadataExport
    summary: SummaryBlock
