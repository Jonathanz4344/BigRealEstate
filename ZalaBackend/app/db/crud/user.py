from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.models.user import User
from app import schemas
from app.models.property import Property
from sqlalchemy.orm import joinedload
from typing import Optional
from app.models.user import user_properties
from app import schemas

"""GET FUNCTIONS"""


def get_user_by_id(db: Session, user_id: int):
    """
    Get a single user by their ID
    SELECT * FROM users WHERE user_id = {user_id}
    """
    return db.query(User).options(joinedload(User.contact), joinedload(User.properties)).filter(User.user_id == user_id).first()


def get_user_by_email(db: Session, email: str):
    """
    Get a single user by their email address
    SELECT * FROM users JOIN contacts WHERE contact.email = {email}
    """
    return db.query(User).join(Contact).filter(Contact.email == email).first()


def get_user_by_username(db: Session, username: str):
    """
    Get a single user by their username
    SELECT * FROM users WHERE username = {username}
    """
    return db.query(User).filter(User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Get a list of users with limits
    SELECT * FROM users OFFSET {skip} LIMIT {limit};
    """
    return db.query(User).options(joinedload(User.contact)).offset(skip).limit(limit).all()


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
    # Create user without automatically creating a Contact. If the client
    # passed contact_id (optional), attach it after validating the contact exists.
    contact_id = getattr(user, "contact_id", None)
    # treat 0 or negative values as no contact provided (client sometimes sends 0)
    if contact_id is not None and isinstance(contact_id, int) and contact_id <= 0:
        contact_id = None
    if contact_id:
        existing_contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
        if not existing_contact:
            # Caller provided an invalid contact_id
            return None

    db_user = User(
        username=user.username,
        profile_pic=user.profile_pic,
        role=user.role,
        contact_id=contact_id,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # TODO: hash password and create UserAuthentication record
    return db_user

def link_contact_to_user(db: Session, user_id: int, contact_id: int) -> Optional[User]:
    """Link an existing Contact to a User (similar behavior to properties linking)."""
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    db_contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
    if not db_contact:
        return None
    # ensure contact not already attached to a different user
    existing = db.query(User).filter(User.contact_id == contact_id).first()
    if existing and existing.user_id != user_id:
        # already linked elsewhere
        return None
    db_user.contact_id = contact_id
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def unlink_contact_from_user(db: Session, user_id: int, contact_id: int) -> Optional[User]:
    """Unlink (but do not delete) a Contact from a User. Returns None if user/contact missing, or the updated user."""
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    if db_user.contact_id != contact_id:
        # nothing to do
        return db_user
    db_user.contact_id = None
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def add_property_to_user(db: Session, user_id: int, property_id: int) -> Optional[User]:
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    db_property = db.query(Property).filter(Property.property_id == property_id).first()
    if not db_property:
        return None
    if db_property in db_user.properties:
        return db_user
    db_user.properties.append(db_property)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_property_ids_for_user(db: Session, user_id: int):
    """Return list of property_ids linked to the user via association table."""
    rows = db.query(user_properties.c.property_id).filter(user_properties.c.user_id == user_id).all()
    return [r[0] for r in rows]


def get_properties_for_user(db: Session, user_id: int):
    """Return full Property objects associated with a user.

    The query reads the association table and returns Property rows with related
    Address and Units eagerly loaded to avoid N+1 on serialization.
    """
    return (
        db.query(Property)
        .join(user_properties, user_properties.c.property_id == Property.property_id)
        .filter(user_properties.c.user_id == user_id)
        .options(joinedload(Property.address), joinedload(Property.units), joinedload(Property.users))
        .all()
    )


def get_contact_for_user(db: Session, user_id: int):
    """Return the Contact object associated with a user, or None."""
    db_user = db.query(User).options(joinedload(User.contact)).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    return db_user.contact


def create_or_update_contact_for_user(db: Session, user_id: int, contact_in: schemas.ContactCreate):
    """Create a new Contact and link it to the user, or update existing contact for that user."""
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None

    # If user already has a contact, update it
    if db_user.contact:
        updated = contact_crud.update_contact(db, db_user.contact.contact_id, contact_in)
        return updated

    # Otherwise create a new contact and attach
    new_contact = contact_crud.create_contact(db, contact_in)
    db_user.contact_id = new_contact.contact_id
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return new_contact


def delete_contact_for_user(db: Session, user_id: int):
    """Unlink and delete the Contact associated with a user. Returns True if deleted, False if not found, None if user missing."""
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    if not db_user.contact_id:
        return False

    contact_id = db_user.contact_id
    # unlink first
    db_user.contact_id = None
    db.add(db_user)
    db.commit()

    # now delete the contact record
    return contact_crud.delete_contact(db, contact_id)


def remove_property_from_user(db: Session, user_id: int, property_id: int) -> Optional[User]:
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    db_property = db.query(Property).filter(Property.property_id == property_id).first()
    if not db_property:
        return None
    if db_property in db_user.properties:
        db_user.properties.remove(db_property)
        db.commit()
        db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(User).filter(User.user_id == user_id).first()

    update_data = user.dict(exclude_unset=True)

    if "contact" in update_data:
        contact_data = update_data.pop("contact")
        if db_user.contact:
            for key, value in contact_data.items():
                setattr(db_user.contact, key, value)

    if "password" in update_data:
        password_data = update_data.pop("password")
        # TODO add functionality for hashing
        pass

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True
