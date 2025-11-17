from typing import List, Optional

from pydantic import BaseModel, Field, model_validator

from app.schemas.summaries import BoardSummary
from app.schemas.lead import LeadPublic
from app.schemas.property import PropertyPublic


class BoardStepBase(BaseModel):
    """
    Shared fields for BoardStep schema variants.
    """

    board_id: int
    board_column: int
    step_name: str


class BoardStepCreate(BoardStepBase):
    """
    Schema for creating a board_step.
    """

    lead_ids: List[int] = Field(default_factory=list)
    property_ids: List[int] = Field(default_factory=list)

    @model_validator(mode="after")
    def ensure_single_target(self) -> "BoardStepCreate":
        if self.lead_ids and self.property_ids:
            raise ValueError("Board step can target leads or properties, but not both.")
        return self


class BoardStepUpdate(BaseModel):
    """
    Schema for updating a board_step.
    """

    board_column: Optional[int] = None
    step_name: Optional[str] = None
    lead_ids: Optional[List[int]] = None
    property_ids: Optional[List[int]] = None

    @model_validator(mode="after")
    def ensure_single_target(self) -> "BoardStepUpdate":
        if self.lead_ids and self.property_ids:
            raise ValueError("Board step can target leads or properties, but not both.")
        return self


class BoardStepPublic(BoardStepBase):
    """
    Schema returned from BoardStep endpoints.
    """

    board_step_id: int
    board: BoardSummary
    leads: List[LeadPublic] = Field(default_factory=list)
    properties: List[PropertyPublic] = Field(default_factory=list)

    class Config:
        from_attributes = True

