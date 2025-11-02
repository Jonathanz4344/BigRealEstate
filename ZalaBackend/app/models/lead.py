from typing import List

from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


campaign_leads = Table(
    "campaign_leads",
    Base.metadata,
    Column("campaign_id", ForeignKey("campaigns.campaign_id"), primary_key=True),
    Column("lead_id", ForeignKey("leads.lead_id"), primary_key=True),
)


class Lead(Base):
    """
    SQLAlchemy model for Lead (leads)
    """
    __tablename__ = "leads"

    lead_id: Mapped[int] = mapped_column(primary_key=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    contact_id: Mapped[int] = mapped_column(ForeignKey("contacts.contact_id"), unique=True, nullable=True)
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.address_id"), unique=True, nullable=True)
    person_type: Mapped[str] = mapped_column(nullable=True)
    business: Mapped[str] = mapped_column(nullable=True)
    website: Mapped[str] = mapped_column(nullable=True)
    license_num: Mapped[str] = mapped_column(nullable=True)
    notes: Mapped[str] = mapped_column(nullable=True)

    created_by_user: Mapped["User"] = relationship("User", back_populates="leads_created", uselist=False)
    # back_populates on contact/address to allow bidirectional access
    contact: Mapped["Contact"] = relationship("Contact", back_populates="leads", uselist=False)
    address: Mapped["Address"] = relationship("Address", back_populates="leads", uselist=False)
    properties: Mapped[List["Property"]] = relationship("Property", back_populates="lead")
    campaign_messages: Mapped[List["CampaignMessage"]] = relationship(
        "CampaignMessage", back_populates="lead", cascade="all, delete-orphan"
    )
    campaigns: Mapped[List["Campaign"]] = relationship(
        "Campaign",
        secondary=campaign_leads,
        back_populates="leads",
    )
