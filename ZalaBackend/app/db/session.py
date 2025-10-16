import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# --- Core Setup (You already have this) ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://your_user:your_password@localhost/your_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    Gets database session to API endpoint
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Creates tables in DB and import all models
    """
    # Import all your models here so Base knows about them
    from ..models import user, property, contact, lead, address, unit, user_authentication
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
