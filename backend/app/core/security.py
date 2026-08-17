"""
Security utilities for password hashing and JWT management.
"""

import logging
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Union

import bcrypt
from jose import jwt

from app.core.config import settings

_logger = logging.getLogger(__name__)

SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = 7


def hash_password(plain_password: str) -> str:
    """ Hashes a plain-text password using bcrypt. """
    password_bytes = plain_password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """ Verifies a plain-text password against a hashed password. """
    password_bytes = plain_password.encode("utf-8")[:72]
    hashed_password_bytes = hashed_password.encode("utf-8")
    try:
        return bcrypt.checkpw(password_bytes, hashed_password_bytes)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    """ Creates a JWT access token (timezone-aware UTC). """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    _logger.info("Access token created for sub: %s", data.get("sub"))
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    """ Creates a JWT refresh token (timezone-aware UTC). """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"type": "refresh", "exp": expire})
    _logger.info("Refresh token created for sub: %s", data.get("sub"))
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def generate_temporary_password(length: int = 10) -> str:
    """ Generates a random complex password with guaranteed character classes. """
    if length < 4:
        length = 4
    specials = "!@#$%^&*()"
    # Guarantee one from each class
    mandatory = [
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.digits),
        secrets.choice(specials),
    ]
    alphabet = string.ascii_letters + string.digits + specials
    remaining = [secrets.choice(alphabet) for _ in range(length - 4)]
    combined = mandatory + remaining
    # Shuffle to randomize positions
    result = list(combined)
    secrets.SystemRandom().shuffle(result)
    return "".join(result)
