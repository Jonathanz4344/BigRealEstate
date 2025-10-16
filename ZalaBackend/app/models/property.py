from typing import List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .user import user_properties
from ..db.session import Base


class Property(Base):
    """
    SQLAlchemy model for Property (properties)
    """
    __tablename__ = "properties"

    property_id: Mapped[int] = mapped_column(primary_key=True)
    property_name: Mapped[str] = mapped_column(nullable=False)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.address_id"), unique=True)
    mls_number: Mapped[str] = mapped_column(unique=True)

    users: Mapped[List["User"]] = relationship(
        secondary=user_properties,
        back_populates="properties"
    )
    units: Mapped[List["Unit"]] = relationship(back_populates="property")

