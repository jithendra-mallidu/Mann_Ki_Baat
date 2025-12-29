from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Book(Base):
    """Book model - top-level container for chapters."""
    
    __tablename__ = "books"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="books")
    chapters = relationship("Chapter", back_populates="book", cascade="all, delete-orphan")
    
    @property
    def note_count(self) -> int:
        """Calculate total notes in this book."""
        return sum(len(chapter.notes) for chapter in self.chapters)
    
    def __repr__(self):
        return f"<Book(id={self.id}, name='{self.name}')>"
