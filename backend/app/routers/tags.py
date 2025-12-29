from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.tag import Tag
from ..schemas.tag import TagCreate, TagUpdate, TagResponse
from ..utils.security import get_current_user

router = APIRouter(prefix="/api/tags", tags=["Tags"])


@router.get("", response_model=List[TagResponse])
def get_tags(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tags for the current user."""
    tags = db.query(Tag).filter(Tag.user_id == current_user.id).all()
    return tags


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag_data: TagCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new tag."""
    tag = Tag(
        name=tag_data.name,
        color=tag_data.color,
        user_id=current_user.id
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    
    return tag


@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: int,
    tag_data: TagUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a tag."""
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    if tag_data.name is not None:
        tag.name = tag_data.name
    if tag_data.color is not None:
        tag.color = tag_data.color
    
    db.commit()
    db.refresh(tag)
    
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a tag."""
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    db.delete(tag)
    db.commit()
    
    return None
