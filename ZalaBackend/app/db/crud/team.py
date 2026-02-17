from typing import List, Optional

from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.models.team import Team
from app.models.user import User
from app.models.user_team import UserTeam
from app.models.board import Board
from app.models.property import Property

# Fields that are not actual columns on the Team model
EXCLUDED_RELATIONSHIP_FIELDS = ("member_ids", "property_ids", "board_ids")


def _prepare_team_payload(payload: dict) -> dict:
    """Remove relationship fields that shouldn't be passed to Team constructor."""
    return {k: v for k, v in payload.items() if k not in EXCLUDED_RELATIONSHIP_FIELDS}


def get_team_by_id(db: Session, team_id: int) -> Optional[Team]:
    """Return a single team by id."""

    return (
        db.query(Team)
        .options(
            joinedload(Team.member_links)
            .joinedload(UserTeam.user)
            .joinedload(User.contact)
        )
        .filter(Team.team_id == team_id)
        .first()
    )


def get_team_with_members(db: Session, team_id: int) -> Optional[Team]:
    """Return a single team by id with all members loaded. Alias for get_team_by_id."""
    return get_team_by_id(db, team_id)


def get_team_with_properties(db: Session, team_id: int):
    return db.query(Team). \
        options(selectinload(Team.properties)). \
        filter(Team.team_id == team_id). \
        first()


def get_team_with_boards(db: Session, team_id: int):
    return db.query(Team). \
        options(selectinload(Team.boards)). \
        filter(Team.team_id == team_id). \
        first()


def get_team_with_boards_and_properties(db: Session, team_id: int):
    return db.query(Team). \
        options(
        selectinload(Team.properties),
        selectinload(Team.boards)
    ). \
        filter(Team.team_id == team_id). \
        first()


def get_teams(db: Session, skip: int = 0, limit: int = 100) -> List[Team]:
    """Return a paginated list of teams."""

    return (
        db.query(Team)
        .options(
            joinedload(Team.member_links)
            .joinedload(UserTeam.user)
            .joinedload(User.contact)
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_teams_by_user(db: Session, user_id: int) -> List[Team]:
    """Return all teams a user belongs to."""

    return (
        db.query(Team)
        .join(UserTeam)
        .options(
            joinedload(Team.member_links)
            .joinedload(UserTeam.user)
            .joinedload(User.contact)
        )
        .filter(UserTeam.user_id == user_id)
        .all()
    )


def create_team(db: Session, team_in: schemas.TeamCreate) -> Team:
    """Persist a new team."""

    payload = _prepare_team_payload(team_in.model_dump())
    team = Team(**payload)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def create_team_with_admin(db: Session, team_in: schemas.TeamCreate, admin_user_id: int) -> Team:
    """
    Create a team and set the creator as admin.
    Raises ValueError if user is already in another team (users can only join 1 team).
    """

    # Check if user is already in a team
    existing_in_team = db.query(UserTeam).filter(UserTeam.user_id == admin_user_id).first()
    if existing_in_team:
        raise ValueError("You're already on a team. You'll need to leave your current team before creating a new one.")

    payload = _prepare_team_payload(team_in.model_dump())
    team = Team(**payload)
    team.created_by_user_id = admin_user_id  # Track who created the team
    db.add(team)
    db.flush()  # Get the team_id

    # Add creator as admin
    user_team = UserTeam(
        user_id=admin_user_id,
        team_id=team.team_id,
        role="admin"
    )
    db.add(user_team)
    db.commit()
    db.refresh(team)
    return team


def update_team(db: Session, team_id: int, team_in: schemas.TeamUpdate) -> Optional[Team]:
    """Update an existing team."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    update_data = _prepare_team_payload(team_in.model_dump(exclude_unset=True))
    for field, value in update_data.items():
        setattr(team, field, value)

    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def delete_team(db: Session, team_id: int) -> bool:
    """Delete a team by id."""

    team = get_team_by_id(db, team_id)
    if not team:
        return False

    db.delete(team)
    db.commit()
    return True


def _append_unique_id(values: List[int], user_id: int) -> List[int]:
    """Return a new list with user_id appended if it was not already present."""

    if values is None:
        values = []
    if user_id in values:
        return values
    return values + [user_id]


def _remove_id(values: List[int], user_id: int) -> List[int]:
    """Return a new list without user_id (if present)."""

    if not values:
        return []
    return [value for value in values if value != user_id]


def add_member(db: Session, team_id: int, user_id: int, role: str = "member") -> Optional[Team]:
    """
    Add a user to the team with specified role using UserTeam relationship.
    Returns None if team not found.
    Raises ValueError if user is already in another team (users can only join 1 team).
    """

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    # Check if user already in THIS team
    existing = db.query(UserTeam).filter(
        UserTeam.team_id == team_id,
        UserTeam.user_id == user_id
    ).first()

    if existing:
        # Update role if already exists in this team
        existing.role = role
    else:
        # Check if user is already in ANOTHER team (constraint: 1 team per user)
        existing_in_other = db.query(UserTeam).filter(
            UserTeam.user_id == user_id
        ).first()

        if existing_in_other:
            raise ValueError("This person is already on another team. Each user can only be on one team.")

        # Create new link
        user_team = UserTeam(
            user_id=user_id,
            team_id=team_id,
            role=role
        )
        db.add(user_team)

    db.commit()
    db.refresh(team)
    return team


def remove_member(db: Session, team_id: int, user_id: int) -> Optional[Team]:
    """Remove a user from the team."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    # Find and delete the user_team link
    user_team = db.query(UserTeam).filter(
        UserTeam.team_id == team_id,
        UserTeam.user_id == user_id
    ).first()

    if user_team:
        db.delete(user_team)
        db.commit()
        db.refresh(team)

    return team


def add_admin(db: Session, team_id: int, user_id: int) -> Optional[Team]:
    """Add a user as admin to the team."""
    return add_member(db, team_id, user_id, role="admin")


def remove_admin(db: Session, team_id: int, user_id: int) -> Optional[Team]:
    """Remove admin role from user (demote to member)."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    user_team = db.query(UserTeam).filter(
        UserTeam.team_id == team_id,
        UserTeam.user_id == user_id
    ).first()

    if user_team and user_team.role == "admin":
        # Demote to member instead of removing
        user_team.role = "member"
        db.commit()
        db.refresh(team)

    return team


def get_user_role_in_team(db: Session, team_id: int, user_id: int) -> Optional[str]:
    """Get a user's role in a team. Returns None if not in team."""

    user_team = db.query(UserTeam).filter(
        UserTeam.team_id == team_id,
        UserTeam.user_id == user_id
    ).first()

    return user_team.role if user_team else None


def get_user_current_team(db: Session, user_id: int) -> Optional[Team]:
    """Get the team a user belongs to (users can only be in 1 team)."""

    user_team = db.query(UserTeam).filter(UserTeam.user_id == user_id).first()
    if not user_team:
        return None

    return get_team_by_id(db, user_team.team_id)


def is_user_in_any_team(db: Session, user_id: int) -> bool:
    """Check if user is already in any team."""

    return db.query(UserTeam).filter(UserTeam.user_id == user_id).first() is not None


def is_user_admin(db: Session, team_id: int, user_id: int) -> bool:
    """Check if user is admin of the team."""
    role = get_user_role_in_team(db, team_id, user_id)
    return role == "admin"


def get_leaderboard(db: Session, limit: int = 10) -> List[Team]:
    """Return teams ordered by XP descending for leaderboard views."""

    safe_limit = max(1, min(limit, 1000))
    return (
        db.query(Team)
        .order_by(Team.xp.desc(), Team.team_name.asc())
        .limit(safe_limit)
        .all()
    )


def get_team_users_by_xp(db: Session, team_id: int) -> Optional[List[tuple]]:
    """Return (user_id, username, xp) tuples ordered by XP for the given team."""

    team = get_team_by_id(db, team_id)
    if not team:
        return None

    # Get user IDs from member_links
    user_ids = [link.user_id for link in team.member_links]

    if not user_ids:
        return []

    rows = (
        db.query(User.user_id, User.username, User.xp)
        .filter(User.user_id.in_(user_ids))
        .order_by(User.xp.desc(), User.username.asc())
        .all()
    )
    return rows


def add_board_to_team(db: Session, team_id: int, board_id: int) -> Optional[Team]:
    """Link an existing Board to a Team"""
    db_team = db.query(Team).filter(Team.team_id == team_id).first()
    if not db_team:
        return None
    db_board = db.query(Board).filter(Board.board_id == board_id).first()
    if not db_board:
        return None
    # ensure board not already attached to a different team
    if db_board.team_id is not None and db_board.team_id != team_id:
        # owned by another team
        return None
    db_board.team_id = team_id
    db.add(db_board)
    db.commit()
    db.refresh(db_team)
    return db_team


def remove_board_from_team(db: Session, team_id: int, board_id: int) -> Optional[Team]:
    """Unlink (but do not delete) a Board from a Team. Returns None if team/board missing, or the updated team."""
    db_team = db.query(Team).filter(Team.team_id == team_id).first()
    db_board = db.query(Board).filter(Board.board_id == board_id).first()
    if not db_team:
        return None
    if db_board.team_id != team_id:
        # nothing to do
        return db_team
    db_board.team_id = None
    db.add(db_board)
    db.commit()
    db.refresh(db_team)
    return db_team


def add_property_to_team(db: Session, team_id: int, property_id: int) -> Optional[Team]:
    """Link an existing Property to a Team"""
    db_team = db.query(Team).filter(Team.team_id == team_id).first()
    if not db_team:
        return None
    db_property = db.query(Property).filter(Property.property_id == property_id).first()
    if not db_property:
        return None
    # ensure property not already attached to a different team
    if db_property.team_id is not None and db_property.team_id != team_id:
        # owned by another team
        return None
    db_property.team_id = team_id
    db.add(db_property)
    db.commit()
    db.refresh(db_team)
    return db_team


def remove_property_from_team(db: Session, team_id: int, property_id: int) -> Optional[Team]:
    """Unlink (but do not delete) a Property from a Team. Returns None if team/property missing, or the updated team."""
    db_team = db.query(Team).filter(Team.team_id == team_id).first()
    db_property = db.query(Property).filter(Property.property_id == property_id).first()
    if not db_team:
        return None
    if db_property.team_id != team_id:
        # nothing to do
        return db_team
    db_property.team_id = None
    db.add(db_property)
    db.commit()
    db.refresh(db_team)
    return db_team


def get_property_ids_for_team(db: Session, team_id: int):
    """Return list of property_ids linked to the team."""
    rows = db.query(Property.property_id).filter(Property.team_id == team_id).all()
    return [r[0] for r in rows]


def get_board_ids_for_team(db: Session, team_id: int):
    """Return list of board_ids linked to the team."""
    rows = db.query(Board.board_id).filter(Board.team_id == team_id).all()
    return [r[0] for r in rows]
