from typing import List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class Lead(Base):
    """
    SQLAlchemy model for Lead (leads)
    """
    __tablename__ = "leads"

    lead_id: Mapped[int] = mapped_column(primary_key=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    contact_id: Mapped[int] = mapped_column(ForeignKey("contacts.contact_id"), unique=True, nullable=True)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.address_id"), unique=True, nullable=True)
    person_type: Mapped[str] = mapped_column(nullable=True)
    business: Mapped[str] = mapped_column(nullable=True)
    website: Mapped[str] = mapped_column(nullable=True)
    license_num: Mapped[str] = mapped_column(nullable=True)
    notes: Mapped[str] = mapped_column(nullable=True)

    created_by_user: Mapped["User"] = relationship("User", back_populates="leads_created", uselist=False)
    # back_populates on contact/address to allow bidirectional access
    contact: Mapped["Contact"] = relationship("Contact", back_populates="leads", uselist=False)
    address: Mapped["Address"] = relationship("Address", back_populates="leads", uselist=False)
    properties: Mapped[List["Property"]] = relationship("Property", back_populates="lead")
