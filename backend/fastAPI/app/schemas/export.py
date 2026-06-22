# M6 — Pydantic schemas for the Document Export Engine
# Mirrors the exact JSON shape that Module 5's AI summarization produces.

from typing import List, Optional
from pydantic import BaseModel, Field


class VideoMetadataExport(BaseModel):
    title: str
    video_url: str
    channel_name: Optional[str] = None
    thumbnail_url: Optional[str] = None


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
