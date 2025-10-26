from sqlalchemy import String, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class Contact(Base):
    __tablename__ = "contacts"

    contact_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True, unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True, unique=True, index=True)

    __table_args__ = (
        UniqueConstraint("email", name="uq_contact_email"),
        UniqueConstraint("phone", name="uq_contact_phone"),
    )

    user: Mapped["User"] = relationship("User", back_populates="contact", uselist=False)
    # A contact can belong to multiple leads (one contact may be referenced by multiple leads)
    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="contact")