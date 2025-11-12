from typing import List, Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class Board(Base):
    """
    SQLAlchemy model for Boards
    """
    __tablename__ = "boards"

    board_id: Mapped[int] = mapped_column(primary_key=True)
    board_name: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.user_id"), nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="boards")
    board_steps: Mapped[List["BoardStep"]] = relationship(
        "BoardStep",
        back_populates="board",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
