from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import schemas
from app.db.crud import board as board_crud
from app.db.session import get_db


router = APIRouter(prefix="/boards", tags=["Boards"])


@router.post("/", response_model=schemas.BoardPublic, status_code=status.HTTP_201_CREATED)
def create_board(board_in: schemas.BoardCreate, db: Session = Depends(get_db)):
    """
    Create a new board.
    """
    return board_crud.create_board(db, board_in)


@router.get("/", summary="Get Boards", response_model=List[schemas.BoardPublic])
def list_boards(
    skip: int = 0,
    limit: int = 100,
    ids: Optional[List[int]] = Query(
        default=None,
        description="Optional list of board ids to fetch. When provided, pagination parameters are ignored.",
    ),
    db: Session = Depends(get_db),
):
    """
    List boards with optional filtering by ids.
    """
    if ids:
        unique_ids = list(dict.fromkeys(ids))
        boards = board_crud.get_boards_by_ids(db, unique_ids)
        if not boards:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Boards not found for provided ids")

        found_ids = {board.board_id for board in boards}
        missing_ids = [board_id for board_id in unique_ids if board_id not in found_ids]
        if missing_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Board(s) not found for id(s): {', '.join(map(str, missing_ids))}",
            )
        return boards

    return board_crud.get_boards(db, skip=skip, limit=limit)


@router.get("/{board_id}", summary="Get Board By Id", response_model=schemas.BoardPublic)
def read_board(board_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a board by id.
    """
    board = board_crud.get_board_by_id(db, board_id)
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return board


@router.put("/{board_id}", response_model=schemas.BoardPublic)
def update_board(board_id: int, board_in: schemas.BoardUpdate, db: Session = Depends(get_db)):
    """
    Update an existing board.
    """
    board = board_crud.update_board(db, board_id, board_in)
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(board_id: int, db: Session = Depends(get_db)):
    """
    Delete a board.
    """
    if not board_crud.delete_board(db, board_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return None
