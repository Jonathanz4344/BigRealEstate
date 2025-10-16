from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class Lead(Base):
    """
    SQLAlchemy model for Lead (leads)
    """
    __tablename__ = "leads"

    lead_id: Mapped[int] = mapped_column(primary_key=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="SET NULL"))
    contact_id: Mapped[int] = mapped_column(ForeignKey("contacts.contact_id"), unique=True)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.address_id"), unique=True)
    person_type: Mapped[str] = mapped_column(nullable=True)
    business: Mapped[str] = mapped_column(nullable=True)
    website: Mapped[str] = mapped_column(nullable=True)
    license_num: Mapped[str] = mapped_column(nullable=True)
    notes: Mapped[str] = mapped_column(nullable=True)

    user: Mapped["Lead"] = relationship(back_populates="leads")
    contact: Mapped["Contact"] = relationship(back_populates="lead")
    address: Mapped["Address"] = relationship(back_populates="lead")

