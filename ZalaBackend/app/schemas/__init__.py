# in app/schemas/__init__.py

from .contact import ContactBase, ContactCreate, ContactUpdate, ContactPublic
from .address import AddressBase, AddressCreate, AddressPublic, AddressUpdate # Added AddressUpdate
from .property import PropertyBase, PropertyCreate, PropertyUpdate, PropertyPublic
from .user import (
    UserBase, UserCreate, UserSignup, UserUpdate, UserPublic, 
    UserPublicWithProperties, UserPublicWithLeads, UserPublicWithLeadsAndProperties,
    UserSummary
)
from .unit import UnitBase, UnitCreate, UnitUpdate, UnitPublic
from .lead import LeadBase, LeadCreate, LeadUpdate, LeadPublic
from .login import Login, GoogleLogin
from .campaign import CampaignBase, CampaignCreate, CampaignUpdate, CampaignPublic
from .campaign_email import (
    CampaignEmailBase,
    CampaignEmailCreate,
    CampaignEmailUpdate,
    CampaignEmailPublic,
    ContactMethod,
)
from .campaign_lead import (
    CampaignLeadBase,
    CampaignLeadCreate,
    CampaignLeadUpdate,
    CampaignLeadPublic,
)
from .location import LocationFilter, DataSource
from .summaries import UserSummary, LeadSummary, PropertySummary, CampaignSummary # Add CampaignSummary


CampaignPublic.model_rebuild()
LeadPublic.model_rebuild()
CampaignLeadPublic.model_rebuild()
