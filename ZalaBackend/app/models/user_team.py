from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db.session import Base


class UserTeam(Base):
    __tablename__ = "users_teams"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), primary_key=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.team_id"), primary_key=True)
    role: Mapped[str] = mapped_column(String(20), default="member")

    user: Mapped["User"] = relationship(back_populates="team_links")
    team: Mapped["Team"] = relationship(back_populates="member_links")
