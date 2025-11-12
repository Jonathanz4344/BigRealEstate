from sqlalchemy import URL, create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

url = URL.create(
    drivername="postgresql",
    username=os.getenv("SQL_UNAME"),
    password=os.getenv("SQL_PASSWORD"),
    host=os.getenv("SQL_HOST"),
    database=os.getenv("SQL_DBNAME"),
    port=os.getenv("SQL_PORT"),
)

engine = create_engine(url)
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
    Drops all tables and recreates them from the current models.
    """
    # Import all your models so Base knows about them
    from ..models import (
        user,
        board,
        board_step,
        property,
        contact,
        lead,
        address,
        unit,
        user_authentication,
        campaign,
        campaign_email,
        campaign_lead
    )

    print("Dropping all database tables...")
    with engine.begin() as connection:
        connection.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
        connection.execute(text("CREATE SCHEMA public;"))
        connection.execute(text("SET search_path TO public;"))

    print("Creating all database tables...")
    with engine.begin() as connection:
        connection.execute(text("SET search_path TO public"))
        Base.metadata.create_all(bind=connection)
