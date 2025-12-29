from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .database import init_db
from .routers import auth_router, books_router, chapters_router, notes_router, tags_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    # Startup: Initialize database
    init_db()
    print("✅ Database initialized")
    yield
    # Shutdown: Cleanup if needed
    print("👋 Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="NoteKeeper API",
    description="Backend API for the NoteKeeper personal note-taking application",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(books_router)
app.include_router(chapters_router)
app.include_router(notes_router)
app.include_router(tags_router)


@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "name": "NoteKeeper API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
