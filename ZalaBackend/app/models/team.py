from datetime import datetime
from typing import List
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from ..db.session import Base


class Team(Base):
    __tablename__ = "teams"

    team_id: Mapped[int] = mapped_column(primary_key=True)
    team_name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(onupdate=func.now(), nullable=True)

    member_links: Mapped[List["UserTeam"]] = relationship(back_populates="team", cascade="all, delete-orphan")
    properties: Mapped[List["Property"]] = relationship(back_populates="team")
    boards: Mapped[List["Board"]] = relationship(back_populates="team")
    invitations: Mapped[List["TeamInvitation"]] = relationship(back_populates="team", cascade="all, delete-orphan")
