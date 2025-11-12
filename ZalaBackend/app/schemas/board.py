from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.user import UserPublic
from app.schemas.board_step import BoardStepPublic


class BoardBase(BaseModel):
    """
    Shared fields for Board schema variants.
    """

    board_name: str
    user_id: Optional[int] = None


class BoardCreate(BoardBase):
    """
    Schema for creating a board.
    """
    pass

class BoardUpdate(BaseModel):
    """
    Schema for updating a board.
    """

    board_name: Optional[str] = None
    user_id: Optional[int] = None


class BoardPublic(BoardBase):
    """
    Schema returned from Board endpoints.
    """

    board_id: int
    user: Optional[UserPublic] = None
    board_steps: List[BoardStepPublic] = Field(default_factory=list)

    class Config:
        from_attributes = True
