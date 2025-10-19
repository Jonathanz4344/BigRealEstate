from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class Contact(Base):
    __tablename__ = "contacts"

    contact_id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(nullable=True)
    email: Mapped[str] = mapped_column(nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)

    user: Mapped["User"] = relationship(back_populates="contact")
    lead: Mapped["Lead"] = relationship(back_populates="contact")
