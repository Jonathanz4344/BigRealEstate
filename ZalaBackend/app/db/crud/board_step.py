from typing import List, Optional, Sequence

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.models.board import Board
from app.models.board_step import BoardStep
from app.models.lead import Lead
from app.models.property import Property


def _with_relationships(query):
    """
    Apply the eager-loading strategy we want for board step responses to load 
    the board, user, leads, and properties associated with this board step.
    """
    return query.options(
        joinedload(BoardStep.board).joinedload(Board.user),
        selectinload(BoardStep.leads),
        selectinload(BoardStep.properties),
    )


def _ensure_board_exists(db: Session, board_id: Optional[int]) -> None:
    """
    Validate that the provided board exists when board_id is supplied.
    """
    if board_id is None:
        return

    exists = db.query(Board.board_id).filter(Board.board_id == board_id).first()
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    

def _validate_and_fetch_leads(db: Session, lead_ids: List[int]) -> List[Lead]:
    """
    Validate that all provided lead IDs exist and return the lead objects.
    """
    if not lead_ids:
        return []
    leads = db.query(Lead).filter(Lead.lead_id.in_(lead_ids)).all()
    found_ids = {lead.lead_id for lead in leads}
    missing_ids = set(lead_ids) - found_ids
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Leads not found: {sorted(missing_ids)}"
        )
    return leads


def _validate_and_fetch_properties(db: Session, property_ids: List[int]) -> List[Property]:
    """
    Validate that all provided property IDs exist and return the property objects.
    """
    if not property_ids:
        return []
    properties = db.query(Property).filter(Property.property_id.in_(property_ids)).all()
    found_ids = {prop.property_id for prop in properties}
    missing_ids = set(property_ids) - found_ids
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Properties not found: {sorted(missing_ids)}"
        )
    return properties


def get_board_step_by_id(db: Session, step_id: int) -> Optional[BoardStep]:
    """
    Retrieve a single board step with its related board, user, leads, and properties.
    """
    return _with_relationships(db.query(BoardStep)).filter(BoardStep.step_id == step_id).first()


def get_board_steps(db: Session, skip: int = 0, limit: int = 100) -> List[BoardStep]:
    """
    Retrieve a paginated list of board steps.
    """
    return _with_relationships(db.query(BoardStep)).offset(skip).limit(limit).all()


def get_board_steps_by_ids(db: Session, step_ids: Sequence[int]) -> List[BoardStep]:
    """
    Retrieve board steps matching the provided ids, preserving the caller's order.
    """
    if not step_ids:
        return []

    steps = (
        _with_relationships(db.query(BoardStep))
        .filter(BoardStep.step_id.in_(step_ids))
        .all()
    )

    steps_by_id = {step.step_id: step for step in steps}
    return [steps_by_id[step_id] for step_id in step_ids if step_id in steps_by_id]


def get_board_steps_by_board_id(db: Session, board_id: int) -> List[BoardStep]:
    """
    Retrieve all board steps for a specific board.
    """
    steps = (
        _with_relationships(db.query(BoardStep))
        .filter(BoardStep.board_id == board_id)
        .all()
    )
    return steps


def create_board_step(db: Session, step_in: schemas.BoardStepCreate) -> BoardStep:
    """
    Persist a new board step.
    """
    payload = step_in.model_dump(exclude={'lead_ids', 'property_ids'})
    _ensure_board_exists(db, payload.get("board_id"))

    leads = _validate_and_fetch_leads(db, step_in.lead_ids or [])
    properties = _validate_and_fetch_properties(db, step_in.property_ids or [])

    step = BoardStep(**payload)
    step.leads = leads
    step.properties = properties

    db.add(step)
    db.commit()
    db.refresh(step)
    return step


def update_board_step(db: Session, step_id: int, step_in: schemas.BoardStepUpdate) -> Optional[BoardStep]:
    """
    Update mutable board step fields.
    """
    step = db.query(BoardStep).filter(BoardStep.step_id == step_id).first()
    if not step:
        return None

    update_data = step_in.model_dump(exclude_unset=True, exclude={'lead_ids', 'property_ids'})

    # Validate board_id if it's being changed
    if "board_id" in update_data:
        _ensure_board_exists(db, update_data["board_id"])

    # Update regular fields
    for field, value in update_data.items():
        setattr(step, field, value)

    # Update leads if provided
    if step_in.lead_ids is not None:
        leads = _validate_and_fetch_leads(db, step_in.lead_ids)
        step.leads = leads
    
    # Update properties if provided
    if step_in.property_ids is not None:
        properties = _validate_and_fetch_properties(db, step_in.property_ids)
        step.properties = properties

    db.add(step)
    db.commit()
    db.refresh(step)
    return step


def delete_board_step(db: Session, step_id: int) -> bool:
    """
    Delete a board step by id.
    """
    step = db.query(BoardStep).filter(BoardStep.step_id == step_id).first()
    if not step:
        return False

    db.delete(step)
    db.commit()
    return True