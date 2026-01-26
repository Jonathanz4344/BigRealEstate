from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from ..db.session import Base


class TeamInvitation(Base):
    __tablename__ = "team_invitations"

    invitation_id: Mapped[int] = mapped_column(primary_key=True)
    recipient_email: Mapped[str] = mapped_column(String(255), nullable=False)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.team_id", ondelete="CASCADE"))
    status: Mapped[bool] = mapped_column(Boolean, default=None)  # None = Pending, False = False, True = Accepted
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    team: Mapped["Team"] = relationship("Team", back_populates="invitations")
