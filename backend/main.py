"""
Main entry point for the FastAPI application.
Initializes the FastAPI app, configures middleware (CORS), rate limiter, static uploads,
and the v1 API router.
"""

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

import app.db.base  # noqa: F401 — ensures all models register for SQLAlchemy
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.limiter import limiter


logging.basicConfig(level=logging.INFO)
_logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# CORS — explicit allow-list from settings.CORS_ORIGINS (never use "*" with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Static uploads — public-by-design (ad images, avatars).
# Anything under uploads/ is anonymously accessible by URL. Do not put private
# documents here; admin-only assets must be served via authenticated endpoints.
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    """ Simple health check endpoint. """
    return {"status": "ok"}
