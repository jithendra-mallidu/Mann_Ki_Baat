from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.book import Book
from ..models.chapter import Chapter
from ..schemas.chapter import ChapterCreate, ChapterUpdate, ChapterResponse
from ..utils.security import get_current_user

router = APIRouter(tags=["Chapters"])


def format_chapter_date(chapter: Chapter) -> str:
    """Format chapter date for frontend display."""
    if chapter.created_at:
        return chapter.created_at.strftime("%m/%d/%y")
    return ""


def chapter_to_response(chapter: Chapter) -> ChapterResponse:
    """Convert chapter model to response schema."""
    return ChapterResponse(
        id=chapter.id,
        name=chapter.name,
        book_id=chapter.book_id,
        date=format_chapter_date(chapter),
        created_at=chapter.created_at,
        updated_at=chapter.updated_at
    )


@router.get("/api/books/{book_id}/chapters", response_model=List[ChapterResponse])
def get_chapters(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all chapters for a specific book."""
    # Verify the book belongs to the user
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    chapters = db.query(Chapter).filter(Chapter.book_id == book_id).all()
    return [chapter_to_response(chapter) for chapter in chapters]


@router.post("/api/books/{book_id}/chapters", response_model=ChapterResponse, status_code=status.HTTP_201_CREATED)
def create_chapter(
    book_id: int,
    chapter_data: ChapterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chapter in a book."""
    # Verify the book belongs to the user
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    chapter = Chapter(
        name=chapter_data.name,
        book_id=book_id
    )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    
    return chapter_to_response(chapter)


@router.get("/api/chapters/{chapter_id}", response_model=ChapterResponse)
def get_chapter(
    chapter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific chapter by ID."""
    chapter = db.query(Chapter).join(Book).filter(
        Chapter.id == chapter_id,
        Book.user_id == current_user.id
    ).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    return chapter_to_response(chapter)


@router.put("/api/chapters/{chapter_id}", response_model=ChapterResponse)
def update_chapter(
    chapter_id: int,
    chapter_data: ChapterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a chapter."""
    chapter = db.query(Chapter).join(Book).filter(
        Chapter.id == chapter_id,
        Book.user_id == current_user.id
    ).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    if chapter_data.name is not None:
        chapter.name = chapter_data.name
    
    db.commit()
    db.refresh(chapter)
    
    return chapter_to_response(chapter)


@router.delete("/api/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chapter(
    chapter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a chapter and all its notes."""
    chapter = db.query(Chapter).join(Book).filter(
        Chapter.id == chapter_id,
        Book.user_id == current_user.id
    ).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    db.delete(chapter)
    db.commit()
    
    return None
