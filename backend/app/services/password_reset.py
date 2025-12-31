import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.password_reset import PasswordResetToken
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_reset_token() -> str:
    """Generate a secure random token for password reset."""
    return secrets.token_urlsafe(32)


def create_password_reset_token(db: Session, user_id: int, expires_in_hours: int = 1) -> PasswordResetToken:
    """Create a new password reset token for a user."""
    token = generate_reset_token()
    expires_at = datetime.now() + timedelta(hours=expires_in_hours)

    reset_token = PasswordResetToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at,
        used=False
    )

    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)

    return reset_token


def get_reset_token(db: Session, token: str) -> PasswordResetToken | None:
    """Get a password reset token by token string."""
    return db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()


def mark_token_as_used(db: Session, reset_token: PasswordResetToken) -> None:
    """Mark a password reset token as used."""
    reset_token.used = True
    db.commit()


def hash_password(password: str) -> str:
    """Hash a password for storing."""
    return pwd_context.hash(password)


def update_user_password(db: Session, user: User, new_password: str) -> None:
    """Update a user's password."""
    user.password_hash = hash_password(new_password)
    db.commit()


def cleanup_expired_tokens(db: Session) -> None:
    """Delete expired password reset tokens."""
    db.query(PasswordResetToken).filter(
        PasswordResetToken.expires_at < datetime.now()
    ).delete()
    db.commit()
