"""
Shared dependencies for FastAPI endpoints.
Provides authentication and RBAC (Role-Based Access Control).
"""

import logging
from typing import List

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.core.roles import RoleConstants

_logger = logging.getLogger(__name__)


class AuthService:
    """
    Handles authentication and RBAC.
    Usage:
        # In your endpoint file:
        from app.api.deps import authentication
        current_user = Depends(authentication.get_super_user([RoleConstants.SUPER_ADMIN]))
    """
    security = HTTPBearer()
    optional_security = HTTPBearer(auto_error=False)

    def get_super_user(self, allowed_roles: List[int]):
        """ Returns a dependency function that validates the user's role. """
        def dependency(
            db: Session = Depends(get_db),
            token: HTTPAuthorizationCredentials = Depends(self.security),
        ):
            """ Decodes JWT and ensures user has an authorized role. """
            from app.modules.users.model import User  # Moved inside to break circular import

            credentials_exception = HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
            try:
                token_value = token.credentials
                payload = jwt.decode(token_value, SECRET_KEY, algorithms=[ALGORITHM])
                user_id = payload.get("sub")
                if user_id is None:
                    raise credentials_exception
                user_id = int(user_id)
            except (JWTError, ValueError):
                _logger.error("Token decoding failed")
                raise credentials_exception

            user = db.query(User).filter(User.id == user_id, User.is_delete.isnot(True)).first()
            if not user or not user.is_active:
                raise HTTPException(status_code=404, detail="User not found or inactive")

            # Validate token version — rejects tokens issued before password reset
            token_version = payload.get("token_version")
            if token_version is not None and token_version != user.token_version:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session expired. Please log in again.",
                )

            if not user.role_id:
                raise HTTPException(status_code=403, detail="User role not assigned")

            if user.role_id in allowed_roles:
                _logger.info("Auth success | User: %s | Role: %s", user.email, user.role_id)
                return user

            _logger.warning("Auth forbidden | User: %s | Role: %s | Required: %s", user.email, user.role_id, allowed_roles)
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to perform this action.",
            )
        return dependency


authentication = AuthService()

# Pre-built dependency shortcuts — add more as needed
get_current_admin_user = authentication.get_super_user([RoleConstants.SUPER_ADMIN])
get_current_user = authentication.get_super_user([RoleConstants.SUPER_ADMIN, RoleConstants.ADMIN, RoleConstants.USER])

def get_current_user_optional(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(authentication.optional_security),
):
    """ Returns the current user if a valid token is provided, else returns None. """
    if not token:
        return None
    try:
        from app.modules.users.model import User
        token_value = token.credentials
        payload = jwt.decode(token_value, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(User).filter(User.id == int(user_id), User.is_delete.isnot(True)).first()
        if not user or not user.is_active:
            return None
        return user
    except Exception:
        return None
