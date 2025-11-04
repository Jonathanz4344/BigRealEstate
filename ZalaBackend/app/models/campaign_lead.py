from typing import List, Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


class CampaignLead(Base):
    """
    SQLAlchemy model for CampaignLeads
    """
    __tablename__ = "campaign_leads"

    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.campaign_id"), nullable=False, primary_key=True)
    lead_id: Mapped[int] = mapped_column(ForeignKey("leads.lead_id"), nullable=False, primary_key=True)
    phone_contacted: Mapped[bool] = mapped_column(default=False)
    sms_contacted: Mapped[bool] = mapped_column(default=False)
    email_contacted: Mapped[bool] = mapped_column(default=False)

    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="campaign_lead")
    lead: Mapped["Lead"] = relationship("Lead", back_populates="campaign_lead")

