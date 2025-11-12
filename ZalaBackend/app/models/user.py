from datetime import datetime
from typing import List

from sqlalchemy import Column, String, ForeignKey, func, DateTime, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base

# association table for user_properties
user_properties = Table(
    "user_properties",
    Base.metadata,
    Column("user_id", ForeignKey("users.user_id"), primary_key=True),
    Column("property_id", ForeignKey("properties.property_id"), primary_key=True),
)

class User(Base):
    """
    SQLAlchemy model for user (users)
    """
    __tablename__ = "users"
    user_id: Mapped[int] = mapped_column(primary_key=True)
    # Allow contact to be nullable so contacts can be created/removed independently
    contact_id: Mapped[int] = mapped_column(ForeignKey("contacts.contact_id"), unique=True, nullable=True)
    username: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user")
    profile_pic: Mapped[str] = mapped_column(nullable=True)
    xp: Mapped[int] = mapped_column(nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    contact: Mapped["Contact"] = relationship("Contact", back_populates="user", uselist=False)
    authentication: Mapped["UserAuthentication"] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)
    properties: Mapped[List["Property"]] = relationship(secondary=user_properties, back_populates="users")
    leads_created: Mapped[List["Lead"]] = relationship("Lead", back_populates="created_by_user")

    campaigns: Mapped[List["Campaign"]] = relationship("Campaign", back_populates="user")
    boards: Mapped[List["Board"]] = relationship("Board", back_populates="user")
