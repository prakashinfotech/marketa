"""
Pydantic schemas for the User module.
Defines the data structure for API requests and responses.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, Any


# ── Request Schemas ──────────────────────────────────────────────────────────

class CreateUserRequest(BaseModel):
    """ Schema for creating a new user. """
    name: str
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    """ Schema for user login. """
    email: EmailStr
    password: str


class GetAllUsersRequest(BaseModel):
    """ Schema for listing all users with pagination. """
    skip: int = 0
    limit: int = 100


class UpdateUserRequest(BaseModel):
    """
    Schema to update a user's details.
    All fields are optional — only provided fields will be updated.
    """
    user_uuid: str
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class DeleteUserRequest(BaseModel):
    """ Schema for deleting a user by UUID. """
    user_uuid: str


class UpdateMyProfileRequest(BaseModel):
    """ Schema for a user updating their own profile. No UUID needed — uses JWT. """
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """ Schema for refreshing an access token. """
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    """ Schema for requesting a password reset link. """
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """ Schema for resetting password via email link. """
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    """ Schema for changing password while logged in. """
    old_password: str
    new_password: str


class ConfirmDeleteAccountRequest(BaseModel):
    """ Schema for confirming account deletion. """
    code: str


# ── Response Schemas ─────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """ Schema for user data returned in responses. """
    id: int
    uuid: str
    name: Optional[str]
    username: str
    email: EmailStr

    class Config:
        from_attributes = True


class Response(BaseModel):
    """
    Generic response schema for User operations.
    All endpoints should return this format:
        {"success": bool, "data": any, "msg": str}
    """
    success: bool
    data: Optional[Any] = None
    msg: Optional[str] = None


class TokenResponse(BaseModel):
    """ Schema for JWT token response. """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
