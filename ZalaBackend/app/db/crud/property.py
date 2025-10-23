from sqlalchemy.orm import Session

from ZalaBackend.app import models
from ZalaBackend.app import schemas

"""GET FUNCTIONS"""


def get_user_by_id(db: Session, property_id: int):
    """
    Get a single user by their ID
    SELECT * FROM users WHERE property_id = {property_id}
    """
    return db.query(models.Property).filter(models.Property.property_id == property_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Get a list of users with limits
    SELECT * FROM users OFFSET {skip} LIMIT {limit};
    """
    return db.query(models.Property).offset(skip).limit(limit).all()


"""CREATE FUNCTIONS"""


def create_property(db: Session, property: schemas.PropertyCreate):
    """
    Create a new property and all associated records.
    This function handles:
    1. Create new Contact - INSERT INTO contacts
    2. Create new User record - INSERT INTO users
    3. Hash user's password - TODO
    4. Create UserAuthentication with hashed password - TODO - INSERT INTO user_authentication

    """
    db_address = models.Address(
        street_1=property.address.street_1,
        street_2=property.address.street_2,
        city=property.address.city,
        state=property.address.state
    )

    db.add(db_address)
    db.commit()
    db.refresh(db_address)

    db_user = models.Property(
        username=user.username,
        profile_pic=user.profile_pic,
        role=user.role,
        address_id=db_address.address_id    # foreign key link to address
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # add functionality for hashing

    return db_user
