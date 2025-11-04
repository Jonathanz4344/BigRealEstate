from datetime import datetime

from sqlalchemy import ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class CampaignEmail(Base):
    """
    SQLAlchemy model for Contact history
    """
    __tablename__ = "campaign_messages"

    message_id: Mapped[int] = mapped_column(primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.campaign_id"), nullable=False)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.lead_id"), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    message_subject: Mapped[str] = mapped_column(nullable=False)
    message_body: Mapped[str] = mapped_column(nullable=False)

    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="campaign_emails")
    lead: Mapped["Lead"] = relationship("Lead", back_populates="campaign_emails")

