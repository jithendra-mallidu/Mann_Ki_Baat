from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.book import Book
from ..schemas.book import BookCreate, BookUpdate, BookResponse
from ..utils.security import get_current_user

router = APIRouter(prefix="/api/books", tags=["Books"])


@router.get("", response_model=List[BookResponse])
def get_books(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all books for the current user."""
    books = db.query(Book).filter(Book.user_id == current_user.id).all()
    return [
        BookResponse(
            id=book.id,
            name=book.name,
            note_count=book.note_count,
            created_at=book.created_at,
            updated_at=book.updated_at
        )
        for book in books
    ]


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book_data: BookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new book."""
    book = Book(
        name=book_data.name,
        user_id=current_user.id
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    
    return BookResponse(
        id=book.id,
        name=book.name,
        note_count=book.note_count,
        created_at=book.created_at,
        updated_at=book.updated_at
    )


@router.get("/{book_id}", response_model=BookResponse)
def get_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific book by ID."""
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    return BookResponse(
        id=book.id,
        name=book.name,
        note_count=book.note_count,
        created_at=book.created_at,
        updated_at=book.updated_at
    )


@router.put("/{book_id}", response_model=BookResponse)
def update_book(
    book_id: int,
    book_data: BookUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a book."""
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    if book_data.name is not None:
        book.name = book_data.name
    
    db.commit()
    db.refresh(book)
    
    return BookResponse(
        id=book.id,
        name=book.name,
        note_count=book.note_count,
        created_at=book.created_at,
        updated_at=book.updated_at
    )


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a book and all its chapters and notes."""
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.user_id == current_user.id
    ).first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    db.delete(book)
    db.commit()
    
    return None
