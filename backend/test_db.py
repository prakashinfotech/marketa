import sys
import os

# Add backend to path
sys.path.append(os.path.abspath('.'))

import app.db.base  # Imports all models into registry
from app.db.session import SessionLocal
from app.modules.notifications.model import Notification

db = SessionLocal()
notifs = db.query(Notification).all()
print(f"Total notifications: {len(notifs)}")
for n in notifs:
    print(f"- User {n.user_id}: {n.title} (Type: {n.type}, Read: {n.is_read})")
