from datetime import datetime

from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
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
    from_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    to_email: Mapped[Optional[str]] = mapped_column(String(320), nullable=True)
    gmail_message_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    gmail_thread_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    send_status: Mapped[str] = mapped_column(String(16), nullable=False, default="draft")
    error_detail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="campaign_emails")
    lead: Mapped["Lead"] = relationship("Lead", back_populates="campaign_emails")

