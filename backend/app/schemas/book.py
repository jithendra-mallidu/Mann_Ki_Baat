from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BookCreate(BaseModel):
    """Schema for creating a book."""
    name: str


class BookUpdate(BaseModel):
    """Schema for updating a book."""
    name: Optional[str] = None


class BookResponse(BaseModel):
    """Schema for book response."""
    id: int
    name: str
    note_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
