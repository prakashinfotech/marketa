"""
CRUD operations for the User module.
Handles user creation, listing, updating, and soft-deletion.
"""

import logging
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from .model import User
from . import schema
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from jose import jwt, JWTError
from app.core.config import settings
import os
import uuid
import shutil

_logger = logging.getLogger(__name__)


class UserCRUD:
    """
    Business logic for managing users.
    Each method returns a dict in the standard response format:
        {"success": bool, "msg": str, "data": dict/list}
    """

    def create_user(self, db: Session, payload: schema.CreateUserRequest) -> dict:
        """
        Creates a new user.
        """
        _logger.info("Attempting to create user: username=%s, email=%s", payload.username, payload.email)
        try:
            # Check for duplicate email
            if db.query(User).filter(User.email == payload.email, User.is_delete.isnot(True)).first():
                _logger.warning("User creation failed: Email %s already exists.", payload.email)
                return {"success": False, "msg": "Email already exists.", "data": {}}

            # Check for duplicate username
            if db.query(User).filter(User.username == payload.username, User.is_delete.isnot(True)).first():
                _logger.warning("User creation failed: Username %s already taken.", payload.username)
                return {"success": False, "msg": "Username already taken.", "data": {}}

            new_user = User(
                name=payload.name,
                username=payload.username,
                email=payload.email,
                password=hash_password(payload.password),
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            _logger.info("User created successfully: %s", new_user.username)

            return {
                "success": True,
                "msg": "User created successfully.",
                "data": {
                    "id": new_user.id,
                    "uuid": new_user.uuid,
                    "name": new_user.name,
                    "username": new_user.username,
                    "email": new_user.email,
                },
            }

        except IntegrityError as e:
            db.rollback()
            _logger.error("Integrity error creating user: %s", str(e))
            return {"success": False, "msg": "Data integrity error (e.g. duplicate username/email).", "data": {}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error creating user: %s", str(e))
            return {"success": False, "msg": "Database error occurred.", "data": {}}
        except Exception as e:
            db.rollback()
            _logger.exception("Error creating user: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

    def authenticate_user(self, db: Session, payload: schema.LoginRequest) -> dict:
        """
        Authenticates a user and generates a JWT.
        """
        _logger.info("Authentication attempt for email: %s", payload.email)
        try:
            user = db.query(User).filter(User.email == payload.email, User.is_delete.isnot(True)).first()
            if not user or not user.is_active:
                return {"success": False, "msg": "Incorrect email or password.", "data": {}}

            if not verify_password(payload.password, user.password):
                return {"success": False, "msg": "Incorrect email or password.", "data": {}}

            # Generate tokens
            access_token = create_access_token(data={"sub": str(user.id), "token_version": user.token_version})
            refresh_token = create_refresh_token(data={"sub": str(user.id), "token_version": user.token_version})

            return {
                "success": True,
                "msg": "Login successful.",
                "data": {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "token_type": "bearer",
                    "user": {
                        "id": user.id,
                        "uuid": user.uuid,
                        "name": user.name,
                        "email": user.email,
                        "role_id": user.role_id,
                    }
                }
            }
        except SQLAlchemyError as e:
            _logger.error("Database error authenticating user: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}
        except Exception as e:
            _logger.exception("Error authenticating user: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

    def refresh_access_token(self, db: Session, payload: schema.RefreshTokenRequest) -> dict:
        """
        Validates a refresh token and generates a new access token.
        """
        _logger.info("Attempting to refresh access token.")
        try:
            # Decode and validate refresh token
            decoded = jwt.decode(payload.refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
            
            if decoded.get("type") != "refresh":
                return {"success": False, "msg": "Invalid token type.", "data": {}}
                
            user_id = decoded.get("sub")
            token_version = decoded.get("token_version")
            
            if not user_id:
                return {"success": False, "msg": "Invalid token payload.", "data": {}}
                
            # Fetch user and check active status
            user = db.query(User).filter(User.id == int(user_id), User.is_delete.isnot(True)).first()
            if not user or not user.is_active:
                return {"success": False, "msg": "User not found or inactive.", "data": {}}
                
            # Check token version (for token revocation)
            if token_version != user.token_version:
                return {"success": False, "msg": "Token has been revoked.", "data": {}}
                
            # Generate new tokens
            new_access_token = create_access_token(data={"sub": str(user.id), "token_version": user.token_version})
            new_refresh_token = create_refresh_token(data={"sub": str(user.id), "token_version": user.token_version})
            
            return {
                "success": True,
                "msg": "Token refreshed successfully.",
                "data": {
                    "access_token": new_access_token,
                    "refresh_token": new_refresh_token,
                    "token_type": "bearer"
                }
            }
        except JWTError:
            return {"success": False, "msg": "Invalid or expired refresh token.", "data": {}}
        except Exception as e:
            _logger.exception("Error refreshing token: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

    def upload_avatar(self, db: Session, user: User, file) -> dict:
        """
        Handles avatar file upload and updates user profile.
        """
        _logger.info("Uploading avatar for user: %s (filename: %s)", user.email, file.filename)
        try:
            # Create directory if not exists
            upload_dir = "uploads/avatars"
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)

            # Generate unique filename
            ext = os.path.splitext(file.filename)[1]
            if ext.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
                return {"success": False, "msg": "Unsupported file format. Use JPG, PNG, or WebP.", "data": {}}

            filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join(upload_dir, filename)

            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Update DB (delete old avatar if exists)
            old_avatar = user.avatar
            if old_avatar and os.path.exists(old_avatar):
                try:
                    os.remove(old_avatar)
                except Exception:
                    pass

            user.avatar = file_path
            db.commit()
            db.refresh(user)
            _logger.info("Avatar updated successfully for user: %s, path: %s", user.email, file_path)

            return {
                "success": True,
                "msg": "Avatar uploaded successfully.",
                "data": {"avatar_url": f"/uploads/avatars/{filename}"}
            }
        except Exception as e:
            db.rollback()
            _logger.exception("Error uploading avatar: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

    def update_my_profile(self, db: Session, user: User, payload: schema.UpdateMyProfileRequest) -> dict:
        """
        Updates the logged-in user's own profile.
        """
        _logger.info("Attempting to update profile for user: %s", user.email)
        try:
            if payload.name is not None:
                user.name = payload.name

            if payload.username is not None and payload.username != user.username:
                existing = db.query(User).filter(
                    User.username == payload.username, User.id != user.id, User.is_delete.isnot(True)
                ).first()
                if existing:
                    return {"success": False, "msg": "This username is already taken.", "data": {}}
                user.username = payload.username

            if payload.email is not None and payload.email != user.email:
                existing = db.query(User).filter(
                    User.email == payload.email, User.id != user.id, User.is_delete.isnot(True)
                ).first()
                if existing:
                    return {"success": False, "msg": "A user with this email already exists.", "data": {}}
                user.email = payload.email

            if payload.phone is not None:
                if payload.phone != (user.phone or ""):
                    existing = db.query(User).filter(
                        User.phone == payload.phone, User.id != user.id, User.is_delete.isnot(True)
                    ).first()
                    if existing:
                        return {"success": False, "msg": "This phone number is already in use.", "data": {}}
                user.phone = payload.phone
            
            if payload.avatar is not None:
                user.avatar = payload.avatar

            db.commit()
            db.refresh(user)
            _logger.info("Profile updated for user: %s", user.email)

            return {
                "success": True,
                "msg": "Profile updated successfully.",
                "data": {
                    "id": user.id,
                    "uuid": user.uuid,
                    "name": user.name,
                    "username": user.username,
                    "email": user.email,
                    "phone": user.phone,
                },
            }
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error updating profile: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}
        except Exception as e:
            db.rollback()
            _logger.exception("Error updating profile: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

    def list_users(self, db: Session, payload: schema.GetAllUsersRequest) -> dict:
        """
        Lists all active users with pagination.
        """
        _logger.info("Listing users: skip=%d, limit=%d", payload.skip, payload.limit)
        try:
            query = db.query(User).filter(User.is_delete.isnot(True))
            total = query.count()
            users = query.offset(payload.skip).limit(payload.limit).all()

            return {
                "success": True,
                "msg": "Users fetched successfully.",
                "data": [
                    {
                        "id": u.id,
                        "uuid": u.uuid,
                        "name": u.name,
                        "username": u.username,
                        "email": u.email,
                        "role_id": u.role_id,
                    }
                    for u in users
                ],
                "total": total,
                "skip": payload.skip,
                "limit": payload.limit,
            }

        except SQLAlchemyError as e:
            _logger.error("Database error listing users: %s", str(e))
            return {"success": False, "msg": "Database error fetching users.", "data": {}}
        except Exception as e:
            _logger.exception("Error listing users: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

    def update_user(self, db: Session, payload: schema.UpdateUserRequest) -> dict:
        """
        Updates a user's details by UUID.
        """
        _logger.info("Admin attempt to update user by UUID: %s", payload.user_uuid)
        try:
            user = db.query(User).filter(
                User.uuid == payload.user_uuid,
                User.is_delete.isnot(True),
            ).first()

            if not user:
                return {"success": False, "msg": "User not found.", "data": {}}

            # Update name
            if payload.name is not None:
                user.name = payload.name

            # Update username (with uniqueness check)
            if payload.username is not None:
                existing = db.query(User).filter(
                    User.username == payload.username,
                    User.id != user.id,
                    User.is_delete.isnot(True),
                ).first()
                if existing:
                    return {"success": False, "msg": "This username is already taken.", "data": {}}
                user.username = payload.username

            # Update email (with uniqueness check)
            if payload.email is not None and payload.email != user.email:
                existing = db.query(User).filter(
                    User.email == payload.email,
                    User.id != user.id,
                    User.is_delete.isnot(True),
                ).first()
                if existing:
                    return {"success": False, "msg": "A user with this email already exists.", "data": {}}
                user.email = payload.email

            db.commit()
            db.refresh(user)
            _logger.info("User updated successfully: %s", user.username)

            return {
                "success": True,
                "msg": "User updated successfully.",
                "data": {
                    "id": user.id,
                    "uuid": user.uuid,
                    "name": user.name,
                    "username": user.username,
                    "email": user.email,
                },
            }

        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error updating user: %s", str(e))
            return {"success": False, "msg": "Database error while updating user.", "data": {}}
        except Exception as e:
            db.rollback()
            _logger.exception("Error updating user: %s", str(e))
            return {"success": False, "msg": "Internal server error while updating user.", "data": {}}

    def delete_user(self, db: Session, payload: schema.DeleteUserRequest) -> dict:
        """
        Soft-deletes a user by UUID.
        """
        _logger.info("Admin attempt to delete user by UUID: %s", payload.user_uuid)
        try:
            user = db.query(User).filter(
                User.uuid == payload.user_uuid,
                User.is_delete.isnot(True),
            ).first()

            if not user:
                return {"success": False, "msg": "User not found.", "data": {}}

            user.is_delete = True
            user.deleted_at = datetime.utcnow()
            db.commit()

            return {"success": True, "msg": "User deleted successfully.", "data": {}}

        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error deleting user: %s", str(e))
            return {"success": False, "msg": "Database error while deleting user.", "data": {}}
        except Exception as e:
            db.rollback()
            _logger.exception("Error deleting user: %s", str(e))
            return {"success": False, "msg": "Internal server error while deleting user.", "data": {}}

    def request_email_verification(self, db: Session, user: User) -> dict:
        """
        Generates a verification token and sends an email.
        """
        _logger.info("Requesting email verification for user: %s", user.email)
        try:
            if user.is_verified:
                return {"success": False, "msg": "Account is already verified.", "data": {}}

            # Generate token (expires in 24 hours)
            from datetime import timedelta
            token_data = {"sub": str(user.id), "type": "verify_email"}
            expire = datetime.utcnow() + timedelta(hours=24)
            to_encode = token_data.copy()
            to_encode.update({"exp": expire})
            token = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)

            # Send email
            from app.utils.email import send_verification_email
            email_sent = send_verification_email(user.email, token, user.name or user.username)

            if email_sent:
                return {"success": True, "msg": "Verification email sent.", "data": {}}
            else:
                return {"success": False, "msg": "Failed to send email. Please try again later.", "data": {}}
        except Exception as e:
            _logger.exception("Error requesting email verification: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}

    def verify_email(self, db: Session, token: str) -> dict:
        """
        Validates the verification token and marks the user as verified.
        """
        _logger.info("Attempting to verify email with token.")
        try:
            decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
            
            if decoded.get("type") != "verify_email":
                return {"success": False, "msg": "Invalid token type.", "data": {}}
                
            user_id = decoded.get("sub")
            if not user_id:
                return {"success": False, "msg": "Invalid token payload.", "data": {}}
                
            user = db.query(User).filter(User.id == int(user_id), User.is_delete.isnot(True)).first()
            if not user:
                return {"success": False, "msg": "User not found.", "data": {}}
                
            if user.is_verified:
                return {"success": True, "msg": "Account is already verified.", "data": {}}

            user.is_verified = True
            db.commit()
            db.refresh(user)

            _logger.info("User %s verified successfully.", user.email)
            return {"success": True, "msg": "Account verified successfully.", "data": {}}
            
        except JWTError:
            return {"success": False, "msg": "Invalid or expired verification link.", "data": {}}
        except Exception as e:
            db.rollback()
            _logger.exception("Error verifying email: %s", str(e))
            return {"success": False, "msg": "Internal server error.", "data": {}}


# Global instance for easy use in endpoints
user = UserCRUD()
