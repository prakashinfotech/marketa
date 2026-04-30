import sys, os
sys.path.append(os.path.abspath('.'))
import app.db.base
from app.db.session import Base
print("Tables in Base:", Base.metadata.tables.keys())
