from pydantic import BaseModel

class Transcript(BaseModel):
    video_url: str
    video_title: str
    text: str
