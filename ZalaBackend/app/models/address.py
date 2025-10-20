from decimal import Decimal

from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class Address(Base):
    """
    SQLAlchemy model for Address (addresses)
    """
    __tablename__ = "addresses"

    address_id: Mapped[int] = mapped_column(primary_key=True)
    street_1: Mapped[str] = mapped_column(nullable=False)
    street_2: Mapped[str] = mapped_column(nullable=True)
    city: Mapped[str] = mapped_column(nullable=False)
    state: Mapped[str] = mapped_column(nullable=False)
    zipcode: Mapped[str] = mapped_column(String(10), nullable=False)
    lat: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=True)
    long: Mapped[Decimal] = mapped_column(Numeric(9, 6), nullable=True)

    property: Mapped["Property"] = relationship(back_populates="address")
    lead: Mapped["Lead"] = relationship(back_populates="address")
