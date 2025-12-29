from .auth import router as auth_router
from .books import router as books_router
from .chapters import router as chapters_router
from .notes import router as notes_router
from .tags import router as tags_router

__all__ = ["auth_router", "books_router", "chapters_router", "notes_router", "tags_router"]
