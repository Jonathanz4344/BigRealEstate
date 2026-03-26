"""Add missing board_type column to boards table."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.session import SessionLocal

db = SessionLocal()
try:
    db.execute(text("ALTER TABLE boards ADD COLUMN IF NOT EXISTS board_type TEXT NOT NULL DEFAULT 'default'"))
    db.commit()
    print("board_type column added (or already exists).")
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
finally:
    db.close()
