from pydantic import BaseModel
from typing import Optional


class TagCreate(BaseModel):
    """Schema for creating a tag."""
    name: str
    color: str = "bg-blue-500"


class TagUpdate(BaseModel):
    """Schema for updating a tag."""
    name: Optional[str] = None
    color: Optional[str] = None


class TagResponse(BaseModel):
    """Schema for tag response."""
    id: int
    name: str
    color: str
    
    class Config:
        from_attributes = True
