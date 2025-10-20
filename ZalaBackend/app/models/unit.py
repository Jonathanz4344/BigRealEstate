from decimal import Decimal

from sqlalchemy import Numeric, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from ..db.session import Base


class Unit(Base):
    """
    SQLAlchemy model for Unit (units)
    """
    __tablename__ = "units"

    unit_id: Mapped[int] = mapped_column(primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.property_id"))
    apt_num: Mapped[str] = mapped_column(nullable=True)
    bedrooms: Mapped[int] = mapped_column(nullable=True)
    bath: Mapped[Decimal] = mapped_column(Numeric(3, 1), nullable=True)
    sqft: Mapped[int] = mapped_column(nullable=True)
    notes: Mapped[str] = mapped_column(nullable=True)

    property: Mapped["Property"] = relationship(back_populates="units")
