from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.db.crud import campaign_message as campaign_message_crud
from app.db.session import get_db


router = APIRouter(prefix="/campaign-messages", tags=["Campaign Messages"])


@router.post("/", response_model=schemas.CampaignMessagePublic, status_code=status.HTTP_201_CREATED)
def create_campaign_message(
    message_in: schemas.CampaignMessageCreate, db: Session = Depends(get_db)
):
    """
    Create a new campaign message.
    """
    return campaign_message_crud.create_campaign_message(db, message_in)


@router.get("/",summary="Get All Compaign Messages", response_model=List[schemas.CampaignMessagePublic])
def list_campaign_messages(
    skip: int = 0,
    limit: int = 100,
    campaign_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    List campaign messages, optionally filtered by campaign_id.
    """
    if campaign_id is not None:
        return campaign_message_crud.get_campaign_messages_for_campaign(
            db, campaign_id=campaign_id, skip=skip, limit=limit
        )
    return campaign_message_crud.get_campaign_messages(db, skip=skip, limit=limit)


@router.get("/campaign/{campaign_id}",summary="Get Compaign Messages For Compaign By Id and Contact Method", response_model=List[schemas.CampaignMessagePublic])
def list_campaign_messages_for_campaign(
    campaign_id: int,
    skip: int = 0,
    limit: int = 100,
    contact_method: Optional[schemas.ContactMethod] = None,
    db: Session = Depends(get_db),
):
    """
    List campaign messages for a specific campaign, optionally filtered by contact method.
    """
    contact_methods = [contact_method] if contact_method else None

    return campaign_message_crud.get_campaign_messages_for_campaign(
        db,
        campaign_id=campaign_id,
        skip=skip,
        limit=limit,
        contact_methods=contact_methods,
    )


@router.get("/{message_id}",summary="Get Compaign Message by id",  response_model=schemas.CampaignMessagePublic)
def get_campaign_message(message_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a campaign message by ID.
    """
    message = campaign_message_crud.get_campaign_message(db, message_id)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign message not found")
    return message


@router.put("/{message_id}", response_model=schemas.CampaignMessagePublic)
def update_campaign_message(
    message_id: int, message_in: schemas.CampaignMessageUpdate, db: Session = Depends(get_db)
):
    """
    Update an existing campaign message.
    """
    message = campaign_message_crud.update_campaign_message(db, message_id, message_in)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign message not found")
    return message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign_message(message_id: int, db: Session = Depends(get_db)):
    """
    Delete a campaign message.
    """
    if not campaign_message_crud.delete_campaign_message(db, message_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign message not found")
    return None
