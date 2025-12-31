from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.user import UserCreate, UserResponse, UserLogin, Token
from ..schemas.password_reset import PasswordResetRequest, PasswordResetConfirm, PasswordResetResponse
from ..services.auth import get_user_by_email, create_user, authenticate_user
from ..services.password_reset import (
    create_password_reset_token,
    get_reset_token,
    mark_token_as_used,
    update_user_password,
)
from ..utils.security import create_access_token, get_current_user
from ..models.user import User
from ..config import get_settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
settings = get_settings()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = create_user(db, user_data)
    return user


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token."""
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token)


@router.post("/login/form", response_model=Token)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with form data (for OAuth2 compatibility)."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.post("/forgot-password", response_model=PasswordResetResponse)
def request_password_reset(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request a password reset. Sends reset token (in development, returns it)."""
    user = get_user_by_email(db, request.email)

    # Always return success to prevent email enumeration
    if not user:
        return PasswordResetResponse(
            message="If the email exists, a password reset link has been sent.",
            reset_token=None
        )

    # Create reset token
    reset_token = create_password_reset_token(db, user.id, expires_in_hours=1)

    # In production, you would send an email here
    # For now, in development mode, we'll return the token
    # TODO: Implement email sending service

    if settings.environment == "development":
        return PasswordResetResponse(
            message="Password reset token generated. Check the response for the token (development only).",
            reset_token=reset_token.token
        )

    return PasswordResetResponse(
        message="If the email exists, a password reset link has been sent.",
        reset_token=None
    )


@router.post("/reset-password", response_model=PasswordResetResponse)
def confirm_password_reset(
    request: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Confirm password reset with token and new password."""
    reset_token = get_reset_token(db, request.token)

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    if not reset_token.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Get user
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update password
    update_user_password(db, user, request.new_password)

    # Mark token as used
    mark_token_as_used(db, reset_token)

    return PasswordResetResponse(
        message="Password has been reset successfully. You can now login with your new password.",
        reset_token=None
    )
