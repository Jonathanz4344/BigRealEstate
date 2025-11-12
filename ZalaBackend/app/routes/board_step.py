from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import schemas
from app.db.crud import board_step as board_step_crud
from app.db.session import get_db

router = APIRouter(prefix="/board-steps", tags=["Board Steps"])


@router.post("/", response_model=schemas.BoardStepPublic, status_code=status.HTTP_201_CREATED)
def create_board_step(step_in: schemas.BoardStepCreate, db: Session = Depends(get_db)):
    """
    Create a new board step.
    """
    return board_step_crud.create_board_step(db, step_in)


@router.get("/", summary="Get Board Steps", response_model=List[schemas.BoardStepPublic])
def list_board_steps(
    skip: int = 0,
    limit: int = 100,
    board_id: Optional[int] = Query(
        default=None,
        description="Optional board_id to filter board steps by a specific board.",
    ),
    ids: Optional[List[int]] = Query(
        default=None,
        description="Optional list of board step ids to fetch. When provided, pagination parameters are ignored.",
    ),
    db: Session = Depends(get_db),
):
    """
    List board steps with optional filtering by ids.
    """
    if ids:
        unique_ids = list(dict.fromkeys(ids))
        steps = board_step_crud.get_board_steps_by_ids(db, unique_ids)
        if not steps:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board steps not found for provided ids")

        found_ids = {step.step_id for step in steps}
        missing_ids = [step_id for step_id in unique_ids if step_id not in found_ids]
        if missing_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Board step(s) not found for id(s): {', '.join(map(str, missing_ids))}",
            )
        return steps
    
    if board_id is not None:
        return board_step_crud.get_board_steps_by_board_id(db, board_id)

    return board_step_crud.get_board_steps(db, skip=skip, limit=limit)


@router.get("/{step_id}", summary="Get Board Step By Id", response_model=schemas.BoardStepPublic)
def read_board_step(step_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a board step by id.
    """
    step = board_step_crud.get_board_step_by_id(db, step_id)
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board step not found")
    return step


@router.put("/{step_id}", response_model=schemas.BoardStepPublic)
def update_board_step(step_id: int, step_in: schemas.BoardStepUpdate, db: Session = Depends(get_db)):
    """
    Update an existing board step.
    """
    step = board_step_crud.update_board_step(db, step_id, step_in)
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board step not found")
    return step


@router.delete("/{step_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board_step(step_id: int, db: Session = Depends(get_db)):
    """
    Delete a board step.
    """
    if not board_step_crud.delete_board_step(db, step_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board step not found")
    return None
