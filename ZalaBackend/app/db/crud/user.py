from sqlalchemy.orm import Session

from app import models
from app import schemas

"""GET FUNCTIONS"""


def get_user_by_id(db: Session, user_id: int):
    """
    Get a single user by their ID
    SELECT * FROM users WHERE user_id = {user_id}
    """
    return db.query(models.User).filter(models.User.user_id == user_id).first()


def get_user_by_email(db: Session, email: str):
    """
    Get a single user by their email address
    SELECT * FROM users JOIN contacts WHERE contact.email = {email}
    """
    return db.query(models.User).join(models.Contact).filter(models.Contact.email == email).first()


def get_user_by_username(db: Session, username: str):
    """
    Get a single user by their username
    SELECT * FROM users WHERE username = {username}
    """
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Get a list of users with limits
    SELECT * FROM users OFFSET {skip} LIMIT {limit};
    """
    return db.query(models.User).offset(skip).limit(limit).all()


"""CREATE FUNCTIONS"""


def create_user(db: Session, user: schemas.UserCreate):
    """
    Create a new user and all associated records.
    This function handles:
    1. Create new Contact - INSERT INTO contacts
    2. Create new User record - INSERT INTO users
    3. Hash user's password - TODO
    4. Create UserAuthentication with hashed password - TODO - INSERT INTO user_authentication

    """
    db_contact = models.Contact(
        first_name=user.contact.first_name,
        last_name=user.contact.last_name,
        email=user.contact.email,
        phone=user.contact.phone
    )

    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)

    db_user = models.User(
        username=user.username,
        profile_pic=user.profile_pic,
        role=user.role,
        contact_id=db_contact.contact_id    # foreign key link to contact
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # add functionality for hashing

    return db_user
