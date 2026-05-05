"""
API endpoints for User management.
"""

import logging
from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps import get_current_admin_user, get_current_user
from app.modules.users.model import User
from . import schema, crud

_logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/create/", response_model=schema.Response)
def create_user(
    payload: schema.CreateUserRequest,
    db: Session = Depends(get_db),
):
    """ Creates a new user. """
    try:
        _logger.info("Create user request for: %s", payload.email)
        response = crud.user.create_user(db=db, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error during user creation: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.post("/login/", response_model=schema.Response)
def login_user(
    payload: schema.LoginRequest,
    db: Session = Depends(get_db),
):
    """ Authenticates a user and returns a JWT. """
    try:
        _logger.info("Login request for: %s", payload.email)
        response = crud.user.authenticate_user(db=db, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 401,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error during login: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.post("/admin-login/", response_model=schema.Response)
def admin_login(
    payload: schema.LoginRequest,
    db: Session = Depends(get_db),
):
    """ Authenticates an admin user and returns a JWT. """
    try:
        _logger.info("Admin login request for: %s", payload.email)
        response = crud.user.admin_authenticate_user(db=db, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 401,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error during admin login: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.post("/refresh-token/", response_model=schema.Response)
def refresh_token(
    payload: schema.RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """ Validates a refresh token and returns a new access token. """
    _logger.info("Incoming token refresh request.")
    try:
        response = crud.user.refresh_access_token(db=db, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 401,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error during token refresh: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.get("/me/", response_model=schema.Response)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """ Returns the currently logged-in user's profile. """
    _logger.info("Fetching profile for current user: %s", current_user.email)
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "msg": "Profile fetched.",
            "data": {
                "id": current_user.id,
                "uuid": current_user.uuid,
                "name": current_user.name,
                "username": current_user.username,
                "email": current_user.email,
                "phone": current_user.phone,
                "avatar": current_user.avatar.replace("uploads/", "/uploads/") if current_user.avatar else None,
                "is_verified": current_user.is_verified,
                "role_id": current_user.role_id,
                "created_at": str(current_user.created_at) if current_user.created_at else None,
            },
        },
    )


@router.post("/me/avatar/", response_model=schema.Response)
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ Uploads a profile picture for the logged-in user. """
    _logger.info("Incoming avatar upload request for user: %s", current_user.email)
    try:
        response = crud.user.upload_avatar(db=db, user=current_user, file=file)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Error uploading avatar: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.put("/me/update/", response_model=schema.Response)
def update_my_profile(
    payload: schema.UpdateMyProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ Allows the logged-in user to update their own profile. """
    _logger.info("Incoming profile update request for user: %s", current_user.email)
    try:
        response = crud.user.update_my_profile(db=db, user=current_user, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Error updating profile: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.post("/get/all/", response_model=schema.Response)
def list_users(
    payload: schema.GetAllUsersRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ Lists all users with pagination. """
    _logger.info("Incoming list users request from: %s", current_user.email)
    try:
        response = crud.user.list_users(db=db, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", []),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error listing users: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.put("/update/", response_model=schema.Response)
def update_user(
    payload: schema.UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """ Updates a user's details. """
    try:
        _logger.info("Update user request by: %s | user_uuid: %s", current_user.email, payload.user_uuid)
        response = crud.user.update_user(db=db, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error during user update: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.post("/delete/", response_model=schema.Response)
def delete_user(
    payload: schema.DeleteUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """ Soft-deletes a user by UUID. """
    try:
        _logger.info("Delete user request for user_uuid: %s", payload.user_uuid)
        response = crud.user.delete_user(db=db, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error during user deletion: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )

@router.post("/request-verification/", response_model=schema.Response)
def request_verification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ Requests an email verification link for the logged-in user. """
    try:
        response = crud.user.request_email_verification(db=db, user=current_user)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error requesting verification: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )

@router.get("/verify-email/", response_model=schema.Response)
def verify_email(
    token: str,
    db: Session = Depends(get_db),
):
    """ Validates the verification token and marks user as verified. """
    try:
        response = crud.user.verify_email(db=db, token=token)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error verifying email: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.post("/forgot-password/", response_model=schema.Response)
def forgot_password(
    payload: schema.ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """ Sends a password reset link to the user's email. """
    try:
        _logger.info("Forgot password request for: %s", payload.email)
        response = crud.user.forgot_password(db=db, payload=payload)
        return JSONResponse(
            status_code=200,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error in forgot-password: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.post("/reset-password/", response_model=schema.Response)
def reset_password(
    payload: schema.ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """ Resets a user's password using a valid reset token. """
    try:
        _logger.info("Reset password attempt.")
        response = crud.user.reset_password(db=db, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error in reset-password: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )


@router.post("/change-password/", response_model=schema.Response)
def change_password(
    payload: schema.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ Changes the current user's password (requires old password). """
    try:
        _logger.info("Change password request from: %s", current_user.email)
        response = crud.user.change_password(db=db, user_obj=current_user, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error in change-password: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )

@router.post("/request-delete-account/", response_model=schema.Response)
def request_delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ Requests account deletion by sending a confirmation code to email. """
    try:
        response = crud.user.request_account_deletion(db=db, user=current_user)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error requesting account deletion: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )

@router.post("/confirm-delete-account/", response_model=schema.Response)
def confirm_delete_account(
    payload: schema.ConfirmDeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ Confirms account deletion with the static code and performs soft delete. """
    try:
        response = crud.user.confirm_account_deletion(db=db, user=current_user, payload=payload)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content={
                "success": response.get("success"),
                "msg": response.get("msg"),
                "data": response.get("data", {}),
            },
        )
    except Exception as e:
        _logger.exception("Unexpected error confirming account deletion: %s", str(e))
        return JSONResponse(
            status_code=500,
            content={"success": False, "msg": "Internal server error", "data": {}},
        )

