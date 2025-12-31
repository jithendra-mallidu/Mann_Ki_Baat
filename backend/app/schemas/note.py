from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NoteCreate(BaseModel):
    """Schema for creating a note."""
    content: str


class NoteUpdate(BaseModel):
    """Schema for updating a note."""
    content: Optional[str] = None


class NoteResponse(BaseModel):
    """Schema for note response."""
    id: int
    content: str
    chapter_id: int
    date: str  # Formatted date string for frontend
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NoteSearchResult(BaseModel):
    """Schema for search results with context."""
    id: int
    content: str
    chapter_id: int
    chapter_name: str
    book_id: int
    book_name: str
    date: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
