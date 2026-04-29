import sys
from app.db.session import SessionLocal
from app.modules.users.model import User
from app.core.security import hash_password
from app.core.roles import RoleConstants
import app.db.base # Register all models

def create_admin(email, password, name="Admin User", username="admin"):
    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"Error: User with email {email} already exists.")
            return

        new_admin = User(
            name=name,
            username=username,
            email=email,
            password=hash_password(password),
            role_id=RoleConstants.SUPER_ADMIN,
            is_active=True,
            is_verified=True
        )
        db.add(new_admin)
        db.commit()
        print(f"Successfully created Super Admin: {email}")
        print(f"Role ID: {RoleConstants.SUPER_ADMIN}")
    except Exception as e:
        db.rollback()
        print(f"Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 create_admin.py <email> <password> [name] [username]")
    else:
        email = sys.argv[1]
        password = sys.argv[2]
        name = sys.argv[3] if len(sys.argv) > 3 else "Admin User"
        username = sys.argv[4] if len(sys.argv) > 4 else "admin"
        create_admin(email, password, name, username)
