from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Chapter(Base):
    """Chapter model - container for notes within a book."""
    
    __tablename__ = "chapters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    book = relationship("Book", back_populates="chapters")
    notes = relationship("Note", back_populates="chapter", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Chapter(id={self.id}, name='{self.name}')>"
