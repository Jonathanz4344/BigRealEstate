from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.models.board import Board
from app.models.board_step import BoardStep
from app.models.lead import Lead
from app.models.property import Property
from app.models import CampaignLead


def _board_step_query(db: Session):
    """
    Apply eager loading needed for BoardStep responses.
    """
    return (
        db.query(BoardStep)
        .options(
            joinedload(BoardStep.board).joinedload(Board.user),
            selectinload(BoardStep.leads)
            .selectinload(Lead.properties)
            .joinedload(Property.address),
            selectinload(BoardStep.leads)
            .selectinload(Lead.properties)
            .selectinload(Property.units),
            selectinload(BoardStep.leads)
            .selectinload(Lead.properties)
            .joinedload(Property.users),
            selectinload(BoardStep.leads).joinedload(Lead.created_by_user),
            selectinload(BoardStep.leads).joinedload(Lead.contact),
            selectinload(BoardStep.leads).joinedload(Lead.address),
            selectinload(BoardStep.leads)
            .selectinload(Lead.campaigns)
            .joinedload(CampaignLead.campaign),
            selectinload(BoardStep.properties).joinedload(Property.address),
            selectinload(BoardStep.properties).selectinload(Property.units),
            selectinload(BoardStep.properties).joinedload(Property.users),
        )
    )


def _ensure_board_exists(db: Session, board_id: int) -> None:
    """
    Validate that the referenced board exists.
    """
    exists = db.query(Board.board_id).filter(Board.board_id == board_id).first()
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")


def _dedupe_ids(raw_ids: Optional[List[int]]) -> List[int]:
    """
    Remove duplicates while preserving order.
    """
    if not raw_ids:
        return []
    return list(dict.fromkeys(raw_ids))


def _load_leads(db: Session, lead_ids: List[int]) -> List[Lead]:
    if not lead_ids:
        return []
    leads = db.query(Lead).filter(Lead.lead_id.in_(lead_ids)).all()
    found_ids = {lead.lead_id for lead in leads}
    missing = [lead_id for lead_id in lead_ids if lead_id not in found_ids]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead(s) not found for id(s): {', '.join(map(str, missing))}",
        )
    leads_by_id = {lead.lead_id: lead for lead in leads}
    return [leads_by_id[lead_id] for lead_id in lead_ids if lead_id in leads_by_id]


def _load_properties(db: Session, property_ids: List[int]) -> List[Property]:
    if not property_ids:
        return []
    properties = db.query(Property).filter(Property.property_id.in_(property_ids)).all()
    found_ids = {prop.property_id for prop in properties}
    missing = [prop_id for prop_id in property_ids if prop_id not in found_ids]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property(ies) not found for id(s): {', '.join(map(str, missing))}",
        )
    properties_by_id = {prop.property_id: prop for prop in properties}
    return [properties_by_id[prop_id] for prop_id in property_ids if prop_id in properties_by_id]


def _apply_targets(
    db: Session,
    board_step: BoardStep,
    lead_ids: Optional[List[int]],
    property_ids: Optional[List[int]],
) -> None:
    """
    Update the many-to-many collections based on the provided ids.
    Passing an empty list clears the association; passing None leaves it unchanged.
    """
    if lead_ids is not None:
        deduped_lead_ids = _dedupe_ids(lead_ids)
        leads = _load_leads(db, deduped_lead_ids)
        board_step.leads = leads
        if leads:
            board_step.properties = []

    if property_ids is not None:
        deduped_property_ids = _dedupe_ids(property_ids)
        properties = _load_properties(db, deduped_property_ids)
        board_step.properties = properties
        if properties:
            board_step.leads = []

    if board_step.leads and board_step.properties:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            detail="Board step cannot contain both leads and properties.",
        )


def create_board_step(db: Session, board_step_in: schemas.BoardStepCreate) -> BoardStep:
    """
    Create a new board step with optional leads or properties.
    """
    _ensure_board_exists(db, board_step_in.board_id)

    board_step = BoardStep(
        board_id=board_step_in.board_id,
        board_column=board_step_in.board_column,
        step_name=board_step_in.step_name,
    )

    _apply_targets(db, board_step, board_step_in.lead_ids, board_step_in.property_ids)

    db.add(board_step)
    db.commit()
    return get_board_step(db, board_step.board_step_id)


def get_board_step(db: Session, board_step_id: int) -> Optional[BoardStep]:
    """
    Retrieve a single board step.
    """
    return (
        _board_step_query(db)
        .filter(BoardStep.board_step_id == board_step_id)
        .first()
    )

def get_board_step_by_id(db: Session, step_id: int) -> Optional[BoardStep]:
    """
    Compatibility helper for routes expecting get_board_step_by_id.
    """
    return get_board_step(db, step_id)


def get_board_steps(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    board_id: Optional[int] = None,
) -> List[BoardStep]:
    """
    List board steps, optionally filtered by board_id.
    """
    query = _board_step_query(db).order_by(BoardStep.board_column.asc())
    if board_id is not None:
        query = query.filter(BoardStep.board_id == board_id)
    return query.offset(skip).limit(limit).all()

def get_board_steps_by_board_id(db: Session, board_id: int) -> List[BoardStep]:
    """
    Compatibility helper to fetch all steps for a board.
    """
    return (
        _board_step_query(db)
        .filter(BoardStep.board_id == board_id)
        .order_by(BoardStep.board_column.asc())
        .all()
    )


def get_board_steps_by_ids(db: Session, step_ids: List[int]) -> List[BoardStep]:
    """
    Fetch specific steps preserving caller order.
    """
    if not step_ids:
        return []

    steps = (
        _board_step_query(db)
        .filter(BoardStep.board_step_id.in_(step_ids))
        .all()
    )
    steps_by_id = {step.board_step_id: step for step in steps}
    return [steps_by_id[step_id] for step_id in step_ids if step_id in steps_by_id]


def update_board_step(
    db: Session,
    board_step_id: int,
    board_step_in: schemas.BoardStepUpdate,
) -> Optional[BoardStep]:
    """
    Update a board step's metadata or assignments.
    """
    board_step = db.query(BoardStep).filter(BoardStep.board_step_id == board_step_id).first()
    if not board_step:
        return None

    update_data = board_step_in.model_dump(exclude_unset=True)
    lead_ids = update_data.pop("lead_ids", None)
    property_ids = update_data.pop("property_ids", None)

    for field, value in update_data.items():
        setattr(board_step, field, value)

    _apply_targets(db, board_step, lead_ids, property_ids)

    db.add(board_step)
    db.commit()
    return get_board_step(db, board_step_id)


def delete_board_step(db: Session, board_step_id: int) -> bool:
    """
    Delete a board step.
    """
    board_step = db.query(BoardStep).filter(BoardStep.board_step_id == board_step_id).first()
    if not board_step:
        return False

    db.delete(board_step)
    db.commit()
    return True
