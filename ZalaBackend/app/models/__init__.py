# in app/models/__init__.py

# Import all models

from .address import Address
from .contact import Contact
from .user_authentication import UserAuthentication
from .user import User
from .property import Property
from .unit import Unit
from .campaign import Campaign
from .campaign_email import CampaignEmail
from .lead import Lead


from .campaign_lead import CampaignLead

from ..db.session import Base