from typing import List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class Lead(Base):
    """
    SQLAlchemy model for Campaigns
    """
    __tablename__ = "campaigns"

    campaign_id: Mapped[int] = mapped_column(primary_key=True)
    campaign_name: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    property_id: Mapped[int] = mapped_column(nullable=True)

    # user: Mapped["User"] = relationship("User", back_populates="campaigns")
    campaign_messages: Mapped[List["CampaignMessage"]] = relationship("CampaignMessage", back_populates="campaign")

