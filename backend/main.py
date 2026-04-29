"""
Main entry point for the FastAPI application.
This module initializes the FastAPI app, configures middleware (CORS, Sessions),
and includes the API router.
"""

import logging
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.staticfiles import StaticFiles
import os

import app.db.base  # Ensures all models are registered for SQLAlchemy relationships
from app.api.v1.api import api_router
from app.core.config import settings


# Configure logging
logging.basicConfig(level=logging.INFO)
_logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Session Secret — unique per-run for security
secret_key = str(uuid.uuid4())


# Session Middleware — enables session support across the app
app.add_middleware(
    SessionMiddleware,
    secret_key=secret_key,
)


# CORS (Cross-Origin Resource Sharing) Configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount static files for uploads
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Include API Routes from the v1 module
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    """ Simple health check endpoint. """
    return {"status": "ok"}
