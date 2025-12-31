from pydantic import BaseModel, EmailStr


class PasswordResetRequest(BaseModel):
    """Schema for requesting password reset."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for confirming password reset."""
    token: str
    new_password: str


class PasswordResetResponse(BaseModel):
    """Schema for password reset response."""
    message: str
    reset_token: str | None = None  # Only in development mode
