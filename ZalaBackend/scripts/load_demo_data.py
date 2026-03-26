"""
Populates the database with fake data for the purpose of demos
"""
from faker import Faker
import random

from app.db.session import SessionLocal

# Force SQLAlchemy to register all models referenced by string names
from app.models import (
    user,
    user_authentication,
    user_google_credentials,
    user_team,
    user_tutorial,
    board,
    board_step,
    team,
    team_invitation,
    team_announcement,
    team_deal,
    property,
    property_image,
    contact,
    lead,
    lead_image,
    address,
    unit,
    campaign,
    campaign_email,
    campaign_lead,
    notification,
    email_verification,
)

from app.models.contact import Contact
from app.models.user import User
from app.models.user_authentication import UserAuthentication
from app.models.user_tutorial import UserTutorial
from app.models.board import Board
from app.models.board_step import BoardStep
from app.models.team import Team
from app.models.user_team import UserTeam
from app.models.team_announcement import TeamAnnouncement
from app.models.campaign import Campaign
from app.models.campaign_lead import CampaignLead
from app.models.lead import Lead
from app.models.address import Address
from app.models.property import Property
from app.models.unit import Unit
from app.utils.security import get_password_hash

fake = Faker()

TEAM_NAMES = ["Super Team", "Ultra Team", "Mega Team"]
LEAD_STEP_NAMES = ["New Lead", "Contact Made", "Sale Closed"]
PROPERTY_STEP_NAMES = ["New Property", "Listed", "Sold"]
CITY_OPTIONS = [("Rochester", "NY"), ("Buffalo", "NY")]

REAL_PROPERTY_ADDRESSES = [
    {"street_1": "260 E Main St", "city": "Rochester", "state": "NY", "zipcode": "14604"},
    {"street_1": "1 East Ave", "city": "Rochester", "state": "NY", "zipcode": "14604"},
    {"street_1": "500 University Ave", "city": "Rochester", "state": "NY", "zipcode": "14607"},
    {"street_1": "45 Exchange Blvd", "city": "Rochester", "state": "NY", "zipcode": "14614"},
    {"street_1": "100 State St", "city": "Rochester", "state": "NY", "zipcode": "14614"},
    {"street_1": "130 E Main St", "city": "Rochester", "state": "NY", "zipcode": "14604"},
    {"street_1": "16 E Main St", "city": "Rochester", "state": "NY", "zipcode": "14614"},
    {"street_1": "25 Franklin St", "city": "Rochester", "state": "NY", "zipcode": "14604"},
    {"street_1": "150 Andrews St", "city": "Rochester", "state": "NY", "zipcode": "14604"},
    {"street_1": "250 Mill St", "city": "Rochester", "state": "NY", "zipcode": "14614"},
    {"street_1": "1 Seneca St", "city": "Buffalo", "state": "NY", "zipcode": "14203"},
    {"street_1": "50 Fountain Plz", "city": "Buffalo", "state": "NY", "zipcode": "14202"},
    {"street_1": "200 Delaware Ave", "city": "Buffalo", "state": "NY", "zipcode": "14202"},
    {"street_1": "425 Michigan Ave", "city": "Buffalo", "state": "NY", "zipcode": "14203"},
    {"street_1": "1207 Delaware Ave", "city": "Buffalo", "state": "NY", "zipcode": "14209"},
    {"street_1": "295 Main St", "city": "Buffalo", "state": "NY", "zipcode": "14203"},
    {"street_1": "301 Ohio St", "city": "Buffalo", "state": "NY", "zipcode": "14204"},
    {"street_1": "700 Main St", "city": "Buffalo", "state": "NY", "zipcode": "14202"},
    {"street_1": "14 Lafayette Sq", "city": "Buffalo", "state": "NY", "zipcode": "14203"},
    {"street_1": "37 Franklin St", "city": "Buffalo", "state": "NY", "zipcode": "14202"},
    {"street_1": "10 Gibbs St", "city": "Rochester", "state": "NY", "zipcode": "14604"},
    {"street_1": "100 S Clinton Ave", "city": "Rochester", "state": "NY", "zipcode": "14604"},
    {"street_1": "40 Franklin St", "city": "Buffalo", "state": "NY", "zipcode": "14202"},
    {"street_1": "465 Washington St", "city": "Buffalo", "state": "NY", "zipcode": "14203"},
    {"street_1": "155 Main St", "city": "Buffalo", "state": "NY", "zipcode": "14203"},
    {"street_1": "36 King St", "city": "Rochester", "state": "NY", "zipcode": "14608"},
    {"street_1": "330 Monroe Ave", "city": "Rochester", "state": "NY", "zipcode": "14607"},
    {"street_1": "510 Clinton Sq", "city": "Rochester", "state": "NY", "zipcode": "14604"},
    {"street_1": "535 Washington St", "city": "Buffalo", "state": "NY", "zipcode": "14203"},
    {"street_1": "65 Niagara Sq", "city": "Buffalo", "state": "NY", "zipcode": "14202"},
]


def build_property_address_pool():
    pool = REAL_PROPERTY_ADDRESSES.copy()
    random.shuffle(pool)
    return pool


def generate_unique_username(db, first, last):
    base = f"{first}{last}".lower()
    base = "".join(c for c in base if c.isalnum())[:15]
    if not base:
        base = "user"

    candidate = base
    i = 1
    while db.query(User).filter(User.username == candidate).first():
        suffix = str(i)
        candidate = base[:15 - len(suffix)] + suffix
        i += 1
    return candidate


def create_lead_address():
    city, state = random.choice(CITY_OPTIONS)
    return Address(
        street_1=fake.street_address(),
        city=city,
        state=state,
        zipcode=fake.zipcode_in_state(state_abbr="NY"),
    )


def create_property_address_data(property_address_pool):
    if not property_address_pool:
        raise ValueError("Ran out of unique property addresses for this seed run.")
    return property_address_pool.pop()


def create_user(db):
    first = fake.first_name()
    last = fake.last_name()
    username = generate_unique_username(db, first, last)

    contact = Contact(
        first_name=first,
        last_name=last,
        email=f"{username}@example.com",
        phone=fake.unique.numerify("555-###-####"),
    )
    db.add(contact)
    db.flush()

    user = User(
        contact_id=contact.contact_id,
        username=username,
        xp=random.randrange(0, 20001, 10),
    )
    db.add(user)
    db.flush()

    db.add(
        UserAuthentication(
            user_id=user.user_id,
            password_hash=get_password_hash("password"),
            auth_provider="local",
        )
    )

    db.add(UserTutorial(user_id=user.user_id))
    db.flush()
    return user


def create_team_with_users(db, name):
    users = [create_user(db) for _ in range(5)]

    team = Team(
        team_name=name,
        xp=random.randrange(0, 120001, 1000),
        created_by_user_id=users[0].user_id,
    )
    db.add(team)
    db.flush()

    for i, u in enumerate(users):
        db.add(
            UserTeam(
                user_id=u.user_id,
                team_id=team.team_id,
                role="admin" if i == 0 else "member",
            )
        )

    db.flush()
    return team, users


def create_team_announcement(db, team, admin_user):
    announcement = TeamAnnouncement(
        team_id=team.team_id,
        author_id=admin_user.user_id,
        title="Welcome to the Team",
        message="hello everyone",
    )
    db.add(announcement)
    db.flush()
    return announcement


def create_lead_board_with_steps(db, user, team):
    board = Board(
        user_id=user.user_id,
        team_id=team.team_id,
        board_name=f"{user.username} leads",
        board_type="lead",
    )
    db.add(board)
    db.flush()

    steps = []
    for i, name in enumerate(LEAD_STEP_NAMES, start=1):
        step = BoardStep(
            board_id=board.board_id,
            board_column=i,
            step_name=name,
        )
        db.add(step)
        steps.append(step)

    db.flush()
    return board, steps


def create_property_board_with_steps(db, user, team):
    board = Board(
        user_id=user.user_id,
        team_id=team.team_id,
        board_name=f"{user.username} properties",
        board_type="property",
    )
    db.add(board)
    db.flush()

    steps = []
    for i, name in enumerate(PROPERTY_STEP_NAMES, start=1):
        step = BoardStep(
            board_id=board.board_id,
            board_column=i,
            step_name=name,
        )
        db.add(step)
        steps.append(step)

    db.flush()
    return board, steps


def create_campaign(db, user):
    campaign = Campaign(
        campaign_name=f"{user.username} Campaign",
        user_id=user.user_id,
    )
    db.add(campaign)
    db.flush()
    return campaign


def create_lead(db, user):
    contact = Contact(
        first_name=fake.first_name(),
        last_name=fake.last_name(),
        email=fake.unique.email(),
        phone=fake.unique.numerify("555-###-####"),
    )
    db.add(contact)
    db.flush()

    address = create_lead_address()
    db.add(address)
    db.flush()

    lead = Lead(
        created_by=user.user_id,
        contact_id=contact.contact_id,
        address_id=address.address_id,
        notes="example note",
    )
    db.add(lead)
    db.flush()

    return lead


def create_leads_for_user(db, user, campaign, steps):
    leads = [create_lead(db, user) for _ in range(5)]

    for lead in leads:
        db.add(
            CampaignLead(
                campaign_id=campaign.campaign_id,
                lead_id=lead.lead_id,
            )
        )

    steps[0].leads.extend(leads[:3])
    steps[1].leads.append(leads[3])
    steps[2].leads.append(leads[4])

    db.flush()


def create_property(db, user, team, property_address_pool):
    raw = create_property_address_data(property_address_pool)

    address = Address(
        street_1=raw["street_1"],
        city=raw["city"],
        state=raw["state"],
        zipcode=raw["zipcode"],
    )
    db.add(address)
    db.flush()

    property_obj = Property(
        property_name=f'{raw["street_1"]} Property',
        address_id=address.address_id,
        team_id=team.team_id,
        notes="example note",
    )
    db.add(property_obj)
    db.flush()

    property_obj.users.append(user)

    unit = Unit(
        property_id=property_obj.property_id,
        apt_num=fake.bothify(text="A#"),
        bedrooms=random.randint(1, 4),
        bath=random.choice([1, 1.5, 2]),
        sqft=random.randint(600, 2500),
        notes="example note",
    )
    db.add(unit)

    db.flush()
    return property_obj


def create_properties_for_user(db, user, team, steps, property_address_pool):
    properties = [
        create_property(db, user, team, property_address_pool)
        for _ in range(2)
    ]

    steps[0].properties.extend(properties)
    db.flush()


def seed_demo_data():
    db = SessionLocal()
    property_address_pool = build_property_address_pool()
    admin_usernames = []

    try:
        if db.query(Team).filter(Team.team_name.in_(TEAM_NAMES)).first():
            print("Demo data already present.")
            return

        for name in TEAM_NAMES:
            team_obj, users = create_team_with_users(db, name)

            if name == "Super Team":
                users[0].username = "johndoe"
                users[0].contact.first_name = "John"
                users[0].contact.last_name = "Doe"
                users[0].contact.email = "johndoe@example.com"

            admin_user = users[0]
            admin_usernames.append(admin_user.username)

            create_team_announcement(db, team_obj, admin_user)

            for user_obj in users:
                lead_board, lead_steps = create_lead_board_with_steps(db, user_obj, team_obj)
                campaign_obj = create_campaign(db, user_obj)
                create_leads_for_user(db, user_obj, campaign_obj, lead_steps)

                property_board, property_steps = create_property_board_with_steps(
                    db, user_obj, team_obj
                )
                create_properties_for_user(
                    db,
                    user_obj,
                    team_obj,
                    property_steps,
                    property_address_pool,
                )

        db.commit()
        print("✅ Demo data successfully loaded!")
        print("Admin demo accounts (password = 'password'):")
        for username in admin_usernames:
            print(f" - {username}")

    except Exception:
        db.rollback()
        print("❌ Demo data loading failed.")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()