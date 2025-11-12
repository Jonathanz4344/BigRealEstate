from typing import List, Optional, Sequence

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.models.board import Board
from app.models.board_step import BoardStep
from app.models.lead import Lead
from app.models.property import Property
from app.models.user import User
from app.models import CampaignLead


def _with_relationships(query):
    """
    Apply the eager-loading strategy we want for board responses.
    """
    step_loader = selectinload(Board.board_steps)
    lead_loader = step_loader.selectinload(BoardStep.leads)
    property_loader = step_loader.selectinload(BoardStep.properties)

    return query.options(
        joinedload(Board.user),
        step_loader,
        lead_loader.selectinload(Lead.properties).joinedload(Property.address),
        lead_loader.selectinload(Lead.properties).selectinload(Property.units),
        lead_loader.selectinload(Lead.properties).joinedload(Property.users),
        lead_loader.joinedload(Lead.created_by_user),
        lead_loader.joinedload(Lead.contact),
        lead_loader.joinedload(Lead.address),
        lead_loader.selectinload(Lead.campaigns).joinedload(CampaignLead.campaign),
        property_loader.joinedload(Property.address),
        property_loader.selectinload(Property.units),
        property_loader.joinedload(Property.users),
    )


def _ensure_user_exists(db: Session, user_id: Optional[int]) -> None:
    """
    Validate that the provided user exists when user_id is supplied.
    """
    if user_id is None:
        return

    exists = db.query(User.user_id).filter(User.user_id == user_id).first()
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


def get_board_by_id(db: Session, board_id: int) -> Optional[Board]:
    """
    Retrieve a single board with its related user and steps.
    """
    return _with_relationships(db.query(Board)).filter(Board.board_id == board_id).first()


def get_boards(db: Session, skip: int = 0, limit: int = 100) -> List[Board]:
    """
    Retrieve a paginated list of boards.
    """
    return _with_relationships(db.query(Board)).offset(skip).limit(limit).all()


def get_boards_by_ids(db: Session, board_ids: Sequence[int]) -> List[Board]:
    """
    Retrieve boards matching the provided ids, preserving the caller's order.
    """
    if not board_ids:
        return []

    boards = (
        _with_relationships(db.query(Board))
        .filter(Board.board_id.in_(board_ids))
        .all()
    )

    boards_by_id = {board.board_id: board for board in boards}
    return [boards_by_id[board_id] for board_id in board_ids if board_id in boards_by_id]


def create_board(db: Session, board_in: schemas.BoardCreate) -> Board:
    """
    Persist a new board.
    """
    payload = board_in.model_dump()
    _ensure_user_exists(db, payload.get("user_id"))

    board = Board(**payload)
    db.add(board)
    db.commit()
    db.refresh(board)
    return board


def update_board(db: Session, board_id: int, board_in: schemas.BoardUpdate) -> Optional[Board]:
    """
    Update mutable board fields.
    """
    board = db.query(Board).filter(Board.board_id == board_id).first()
    if not board:
        return None

    update_data = board_in.model_dump(exclude_unset=True)
    if "user_id" in update_data:
        _ensure_user_exists(db, update_data["user_id"])

    for field, value in update_data.items():
        setattr(board, field, value)

    db.add(board)
    db.commit()
    db.refresh(board)
    return board


def delete_board(db: Session, board_id: int) -> bool:
    """
    Delete a board by id.
    """
    board = db.query(Board).filter(Board.board_id == board_id).first()
    if not board:
        return False

    db.delete(board)
    db.commit()
    return True
