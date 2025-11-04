import re
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.models.user import User
from app.models.property import Property
from sqlalchemy.orm import joinedload
from typing import Optional, Sequence, List
from app.models.user import user_properties
from app import schemas

from app.models.user_authentication import UserAuthentication
from app.utils import security
from app.db.crud import contact as contact_crud

"""GET FUNCTIONS"""


def get_user_by_id(db: Session, user_id: int):
    """
    Get a single user by their ID
    SELECT * FROM users WHERE user_id = {user_id}
    """
    return db.query(User).options(joinedload(User.contact), joinedload(User.properties)).filter(
        User.user_id == user_id).first()


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


def get_users_by_ids(db: Session, user_ids: Sequence[int]) -> List[User]:
    """
    Get users matching a list of IDs. Returns results in the same order the IDs were provided.
    """
    if not user_ids:
        return []

    users = (
        db.query(User)
        .options(joinedload(User.contact), joinedload(User.properties))
        .filter(User.user_id.in_(user_ids))
        .all()
    )

    users_by_id = {user.user_id: user for user in users}
    return [users_by_id[user_id] for user_id in user_ids if user_id in users_by_id]


def get_user_by_provider(db: Session, provider: str, provider_subject: str) -> Optional[User]:
    """
    Look up a user by external auth provider identifier.
    """
    if not provider_subject:
        return None

    return (
        db.query(User)
        .join(UserAuthentication, UserAuthentication.user_id == User.user_id)
        .options(joinedload(User.contact), joinedload(User.properties))
        .filter(
            UserAuthentication.auth_provider == provider,
            UserAuthentication.provider_subject == provider_subject,
        )
        .first()
    )


def _sanitize_username_seed(seed: Optional[str]) -> str:
    sanitized = re.sub(r"[^a-zA-Z0-9_]", "", seed or "")
    sanitized = sanitized.lower()
    return sanitized or "user"


def _generate_unique_username(db: Session, seed: Optional[str]) -> str:
    base_seed = _sanitize_username_seed(seed)
    base = base_seed[:15]
    candidate = base or "user"
    counter = 1

    while get_user_by_username(db, candidate):
        suffix = str(counter)
        available_length = max(1, 15 - len(suffix))
        candidate = f"{base_seed[:available_length]}{suffix}" if base_seed else f"user{suffix}"
        counter += 1

    return candidate


def _ensure_contact_for_google_profile(db: Session, profile: dict) -> Contact:
    email = profile.get("email")
    if email:
        existing = db.query(Contact).filter(Contact.email == email).first()
        if existing:
            return existing

    first_name = (
        profile.get("given_name")
        or profile.get("name")
        or (email.split("@")[0] if email else "Google")
    )
    last_name = profile.get("family_name")

    contact = Contact(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=None,
    )
    db.add(contact)
    db.flush()
    return contact


def _attach_google_identity_to_user(db: Session, db_user: User, profile: dict) -> User:
    db_auth = (
        db.query(UserAuthentication)
        .filter(UserAuthentication.user_id == db_user.user_id)
        .first()
    )

    if not db_auth:
        db_auth = UserAuthentication(user_id=db_user.user_id)

    db_auth.auth_provider = "google"
    db_auth.provider_subject = profile.get("sub")
    db_auth.provider_email = profile.get("email")

    if profile.get("picture") and not db_user.profile_pic:
        db_user.profile_pic = profile["picture"]

    if not db_user.contact_id:
        contact = _ensure_contact_for_google_profile(db, profile)
        db_user.contact_id = contact.contact_id

    db.add(db_user)
    db.add(db_auth)
    db.commit()
    db.refresh(db_user)
    return db_user


def _create_user_from_google_profile(db: Session, profile: dict) -> User:
    contact = _ensure_contact_for_google_profile(db, profile)
    username_seed = profile.get("email") or profile.get("given_name") or profile.get("name")
    username = _generate_unique_username(db, username_seed)

    db_user = User(
        username=username,
        profile_pic=profile.get("picture"),
        role="user",
        contact_id=contact.contact_id if contact else None,
    )
    db.add(db_user)
    db.flush()

    db_auth = UserAuthentication(
        user_id=db_user.user_id,
        auth_provider="google",
        provider_subject=profile.get("sub"),
        provider_email=profile.get("email"),
    )
    db.add(db_auth)

    db.commit()
    db.refresh(db_user)
    return db_user


def upsert_google_user(db: Session, profile: dict) -> Optional[User]:
    """
    Find or create a user using Google profile information.
    """
    provider_subject = profile.get("sub")
    email = profile.get("email")

    user = get_user_by_provider(db, "google", provider_subject)
    if user:
        return user

    if email:
        user = get_user_by_email(db, email)
        if user:
            return _attach_google_identity_to_user(db, user, profile)

    return _create_user_from_google_profile(db, profile)


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
    # Flush to persist the user and populate db_user.user_id
    db.flush()

    hashed_password = security.get_password_hash(user.password)
    db_auth = UserAuthentication(
        user_id=db_user.user_id,
        password_hash=hashed_password,
        auth_provider="local",
    )
    db.add(db_auth)

    db.commit()
    db.refresh(db_user)

    return db_user


def create_user_with_contact(db: Session, user: schemas.UserSignup) -> User:
    """
    Create a new user along with a brand new contact atomically.
    """
    existing_user = get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists.",
        )

    contact_in = user.contact

    if contact_in.email:
        existing = db.query(Contact).filter(Contact.email == contact_in.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A contact with this email already exists.",
            )

    if contact_in.phone:
        existing = db.query(Contact).filter(Contact.phone == contact_in.phone).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A contact with this phone already exists.",
            )

    db_contact = Contact(
        first_name=contact_in.first_name,
        last_name=contact_in.last_name,
        email=contact_in.email,
        phone=contact_in.phone,
    )

    db.add(db_contact)
    try:
        db.flush()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create contact for user signup.",
        ) from exc

    db_user = User(
        username=user.username,
        profile_pic=user.profile_pic,
        role=user.role,
        contact_id=db_contact.contact_id,
    )

    db.add(db_user)
    try:
        db.flush()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists.",
        ) from exc

    hashed_password = security.get_password_hash(user.password)
    db_auth = UserAuthentication(
        user_id=db_user.user_id,
        password_hash=hashed_password,
        auth_provider="local",
    )
    db.add(db_auth)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to complete user signup.",
        ) from exc

    db.refresh(db_user)
    # ensure relationship resolved without extra DB hits later
    if db_user.contact is None:
        db_user.contact = db_contact

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


def authenticate_user(db: Session, username: str, password: str) -> User | None:

    db_user = get_user_by_username(db,username)

    if not db_user:
        return None

    db_auth = db.query(UserAuthentication).filter(UserAuthentication.user_id == db_user.user_id).first()

    if not db_auth:
        return None

    if db_auth.auth_provider != "local":
        return None

    if not db_auth.password_hash:
        return None

    # verify password
    if not security.verify_password(password, db_auth.password_hash):
        return None

    # If all checks pass, return the user
    return db_user
