from sqlalchemy import create_engine, URL
from sqlalchemy.orm import sessionmaker, declarative_base

url = URL.create(
    drivername="postgresql",
    username="postgresadmin",
    password="master",
    host="localhost",
    database="zala",
    port=5432
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
    from ..models import user, property, contact, lead, address, unit, user_authentication

    print("Dropping all database tables...")
    Base.metadata.drop_all(bind=engine)

    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)