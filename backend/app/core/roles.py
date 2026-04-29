"""
Constants for role identification.
Add new roles here as the application grows.
"""


class RoleConstants:
    """
    Static class for user role IDs.
    These map to the `role_specific_id` column in the roles table.
    """
    SUPER_ADMIN = 1
    ADMIN = 2
    USER = 3
