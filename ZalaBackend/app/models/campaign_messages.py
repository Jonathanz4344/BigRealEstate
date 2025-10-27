from typing import List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class CampaignMessage(Base):
    """
    SQLAlchemy model for Contact history
    """
    __tablename__ = "contact_history"

    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.campaign_id"), nullable=True)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.lead_id"), nullable=True)
    contact_method: Mapped[str] = mapped_column(nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    message_subject: Mapped[str] = mapped_column(nullable=False)
    message_body: Mapped[str] = mapped_column(nullable=False)

    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="campaign_messages")
    lead: Mapped["Lead"] = relationship("Lead", back_populates="campaign_messages")

