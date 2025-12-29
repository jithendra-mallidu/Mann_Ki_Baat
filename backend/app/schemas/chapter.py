from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ChapterCreate(BaseModel):
    """Schema for creating a chapter."""
    name: str


class ChapterUpdate(BaseModel):
    """Schema for updating a chapter."""
    name: Optional[str] = None


class ChapterResponse(BaseModel):
    """Schema for chapter response."""
    id: int
    name: str
    book_id: int
    date: str  # Formatted date string for frontend
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
