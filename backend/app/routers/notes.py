from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.book import Book
from ..models.chapter import Chapter
from ..models.note import Note
from ..schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteSearchResult
from ..utils.security import get_current_user

router = APIRouter(tags=["Notes"])


def format_note_date(note: Note) -> str:
    """Format note date for frontend display."""
    if note.created_at:
        return note.created_at.strftime("%b %d, %Y")
    return ""


def note_to_response(note: Note) -> NoteResponse:
    """Convert note model to response schema."""
    return NoteResponse(
        id=note.id,
        content=note.content,
        chapter_id=note.chapter_id,
        date=format_note_date(note),
        created_at=note.created_at,
        updated_at=note.updated_at
    )


@router.get("/api/notes/search", response_model=List[NoteSearchResult])
def search_notes(
    q: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search for notes across all books and chapters for the current user."""
    if not q or len(q.strip()) == 0:
        return []

    search_term = f"%{q}%"

    # Query notes with book and chapter information
    results = db.query(Note, Chapter, Book).join(
        Chapter, Note.chapter_id == Chapter.id
    ).join(
        Book, Chapter.book_id == Book.id
    ).filter(
        Book.user_id == current_user.id,
        Note.content.ilike(search_term)
    ).order_by(Note.created_at.desc()).limit(50).all()

    search_results = []
    for note, chapter, book in results:
        search_results.append(NoteSearchResult(
            id=note.id,
            content=note.content,
            chapter_id=note.chapter_id,
            chapter_name=chapter.name,
            book_id=book.id,
            book_name=book.name,
            date=format_note_date(note),
            created_at=note.created_at,
            updated_at=note.updated_at
        ))

    return search_results


@router.get("/api/chapters/{chapter_id}/notes", response_model=List[NoteResponse])
def get_notes(
    chapter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notes for a specific chapter."""
    # Verify the chapter belongs to the user (through book)
    chapter = db.query(Chapter).join(Book).filter(
        Chapter.id == chapter_id,
        Book.user_id == current_user.id
    ).first()

    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    notes = db.query(Note).filter(Note.chapter_id == chapter_id).order_by(Note.created_at.desc()).all()
    return [note_to_response(note) for note in notes]


@router.post("/api/chapters/{chapter_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    chapter_id: int,
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new note in a chapter."""
    # Verify the chapter belongs to the user (through book)
    chapter = db.query(Chapter).join(Book).filter(
        Chapter.id == chapter_id,
        Book.user_id == current_user.id
    ).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    note = Note(
        content=note_data.content,
        chapter_id=chapter_id
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return note_to_response(note)


@router.get("/api/notes/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific note by ID."""
    note = db.query(Note).join(Chapter).join(Book).filter(
        Note.id == note_id,
        Book.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return note_to_response(note)


@router.put("/api/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_data: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a note."""
    note = db.query(Note).join(Chapter).join(Book).filter(
        Note.id == note_id,
        Book.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    if note_data.content is not None:
        note.content = note_data.content
    
    db.commit()
    db.refresh(note)
    
    return note_to_response(note)


@router.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a note."""
    note = db.query(Note).join(Chapter).join(Book).filter(
        Note.id == note_id,
        Book.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    db.delete(note)
    db.commit()
    
    return None
