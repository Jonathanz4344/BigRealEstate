from typing import List, Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .user import user_properties
from .board_step import board_step_properties
from ..db.session import Base


class Property(Base):
    """
    SQLAlchemy model for Property (properties)
    """
    __tablename__ = "properties"

    property_id: Mapped[int] = mapped_column(primary_key=True)
    property_name: Mapped[str] = mapped_column(nullable=False)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.address_id"), unique=True)
    mls_number: Mapped[str] = mapped_column(nullable=True)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.lead_id"), nullable=True)
    notes: Mapped[str] = mapped_column(nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(nullable=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.team_id"), nullable=True)

    users: Mapped[List["User"]] = relationship(
        secondary=user_properties,
        back_populates="properties"
    )
    units: Mapped[List["Unit"]] = relationship("Unit", back_populates="property", cascade="all, delete-orphan")
    lead: Mapped["Lead"] = relationship("Lead", back_populates="properties", uselist=False)
    address: Mapped["Address"] = relationship("Address", back_populates="property", uselist=False)
    board_steps: Mapped[List["BoardStep"]] = relationship(
        "BoardStep",
        secondary=board_step_properties,
        back_populates="properties",
    )
    images: Mapped[List["PropertyImage"]] = relationship(
        "PropertyImage",
        back_populates="property",
        cascade="all, delete-orphan",
        order_by="PropertyImage.sort_order",
    )
    team: Mapped[Optional["Team"]] = relationship("Team", back_populates="properties")
