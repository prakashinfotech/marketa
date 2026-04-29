"""
Database dependency injection.
Use `Depends(get_db)` in your endpoints to get a database session.
"""

from app.db.session import SessionLocal


def get_db():
    """ Generator function to provide a database session. """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
