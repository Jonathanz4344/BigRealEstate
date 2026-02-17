# in app/schemas/__init__.py

from .contact import ContactBase, ContactCreate, ContactUpdate, ContactPublic
from .address import AddressBase, AddressCreate, AddressPublic, AddressUpdate # Added AddressUpdate
from .property import PropertyBase, PropertyCreate, PropertyUpdate, PropertyPublic
from .property_image import PropertyImagePublic
from .board import BoardBase, BoardCreate, BoardUpdate, BoardPublic
from .board_step import BoardStepBase, BoardStepCreate, BoardStepUpdate, BoardStepPublic
from .user import (
    UserBase, UserCreate, UserSignup, UserUpdate, UserPublic, 
    UserPublicWithProperties, UserPublicWithLeads, UserPublicWithLeadsAndProperties,
    UserSummary
)
from .unit import UnitBase, UnitCreate, UnitUpdate, UnitPublic
from .lead import LeadBase, LeadCreate, LeadUpdate, LeadPublic
from .lead_image import LeadImagePublic
from .login import Login, GoogleLogin
from .campaign import CampaignBase, CampaignCreate, CampaignUpdate, CampaignPublic
from .campaign_email import (
    CampaignEmailBase,
    CampaignEmailCreate,
    CampaignEmailSendRequest,
    CampaignEmailSendResponse,
    CampaignEmailSendResult,
    CampaignEmailUpdate,
    CampaignEmailPublic,
    CampaignEmailStatus,
    ContactMethod,
)
from .gmail import GmailSendRequest, GmailSendResponse
from .campaign_lead import (
    CampaignLeadBase,
    CampaignLeadCreate,
    CampaignLeadUpdate,
    CampaignLeadPublic,
    CampaignLeadDetailedPublic,
)
from .location import LocationFilter, DataSource
from .summaries import UserSummary, LeadSummary, PropertySummary, CampaignSummary # Add CampaignSummary
from .team import (
    TeamBase,
    TeamCreate,
    TeamUpdate,
    TeamPublic,
    TeamLeaderboardEntry,
    TeamUserXPEntry,
    TeamPublicWithProperties,
    TeamPublicWithBoards,
    TeamPublicWithPropertiesAndBoards,
    TeamPublicWithInvitations,
    TeamMembersOnlyPublic,
    TeamAdminsPublic,
    TeamMemberPublic
)
from .team_invitation import (
    TeamInvitationBase,
    TeamInvitationCreate,
    TeamInvitationUpdate,
    TeamInvitationPublic,
)
from .notification import (
    NotificationBase,
    NotificationUpdate,
    NotificationPublic,
)
from .team import TeamSummary
from .team_announcement import (
    AnnouncementBase,
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementPublic,
)


CampaignPublic.model_rebuild()
LeadPublic.model_rebuild()
CampaignLeadPublic.model_rebuild()
CampaignLeadDetailedPublic.model_rebuild()
PropertyPublic.model_rebuild()
BoardPublic.model_rebuild()
