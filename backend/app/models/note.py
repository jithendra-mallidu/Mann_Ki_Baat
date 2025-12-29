from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Note(Base):
    """Note model - individual note entries within chapters."""
    
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    chapter = relationship("Chapter", back_populates="notes")
    
    def __repr__(self):
        return f"<Note(id={self.id}, content='{self.content[:30]}...')>"
