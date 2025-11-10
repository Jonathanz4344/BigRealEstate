from typing import List, Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base

# association table for board_step_leads
board_step_properties = Table(
    "board_step_properties",
    Base.metadata,
    Column("board_step_id", ForeignKey("users.board_step_id"), primary_key=True),
    Column("lead_id", ForeignKey("leads.lead_id"), primary_key=True),
)

# association table for board_step_properties
board_step_properties = Table(
    "board_step_properties",
    Base.metadata,
    Column("board_step_id", ForeignKey("users.board_step_id"), primary_key=True),
    Column("property_id", ForeignKey("properties.property_id"), primary_key=True),
)


class BoardStep(Base):
    """
    SQLAlchemy model for Board Steps
    """
    __tablename__ = "board_steps"

    board_step_id: Mapped[int] = mapped_column(primary_key=True)
    board_id: Mapped[int] = mapped_column(nullable=False)
    board_column: Mapped[int] = mapped_column(nullable=False)
    step_name: Mapped[str] = mapped_column(nullable=True)

    board: Mapped[Optional["Board"]] = relationship("Board", back_populates="board_steps")
    leads: Mapped[List["Lead"]] = relationship(secondary=board_step_leads, back_populates="board_steps")
    properties: Mapped[List["Property"]] = relationship(secondary=board_step_properties, back_populates="board_steps")
