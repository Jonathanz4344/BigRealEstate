from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.db.crud import campaign_email as campaign_email_crud
from app.db.session import get_db

router = APIRouter(prefix="/campaign-emails", tags=["Campaign Emails"])


@router.post("/", response_model=schemas.CampaignEmailPublic, status_code=status.HTTP_201_CREATED)
def create_campaign_email(
        message_in: schemas.CampaignEmailCreate, db: Session = Depends(get_db)
):
    """
    Create a new campaign email.
    """
    return campaign_email_crud.create_campaign_email(db, message_in)


@router.get("/", summary="Get All Campaign Emails", response_model=List[schemas.CampaignEmailPublic])
def list_campaign_emails(
        skip: int = 0,
        limit: int = 100,
        campaign_id: Optional[int] = None,
        db: Session = Depends(get_db),
):
    """
    List campaign emails, optionally filtered by campaign_id.
    """
    if campaign_id is not None:
        return campaign_email_crud.get_campaign_emails_for_campaign(
            db, campaign_id=campaign_id, skip=skip, limit=limit
        )
    return campaign_email_crud.get_campaign_emails(db, skip=skip, limit=limit)


# @router.get("/campaign/{campaign_id}", summary="Get Campaign Emails For Campaign By Id and Contact Method",
#             response_model=List[schemas.CampaignEmailPublic])
# def list_campaign_emails_by_contact(
#         campaign_id: int,
#         skip: int = 0,
#         limit: int = 100,
#         contact_method: Optional[schemas.ContactMethod] = None,
#         db: Session = Depends(get_db),
# ):
#     """
#     List campaign emails for a specific campaign, optionally filtered by contact method.
#     """
#     contact_methods = [contact_method] if contact_method else None
#
#     return campaign_email_crud.get_campaign_emails_for_campaign(
#         db,
#         campaign_id=campaign_id,
#         skip=skip,
#         limit=limit,
#         contact_methods=contact_methods,
#     )


@router.get("/campaign/{campaign_id}/lead/{lead_id}", summary="Get Campaign Emails For Campaign By Lead ID",
            response_model=List[schemas.CampaignEmailPublic])
def list_campaign_emails_by_lead(
        campaign_id: int,
        lead_id: int,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
):
    """
    List campaign emails for a specific campaign, filtered by lead
    """

    return campaign_email_crud.get_campaign_emails_by_lead(
        db,
        campaign_id=campaign_id,
        lead_id=lead_id,
        skip=skip,
        limit=limit,
    )


@router.get("/{message_id}", summary="Get Campaign Email by id", response_model=schemas.CampaignEmailPublic)
def get_campaign_email(message_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a campaign email by ID.
    """
    message = campaign_email_crud.get_campaign_email(db, message_id)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign email not found")
    return message


@router.put("/{message_id}", response_model=schemas.CampaignEmailPublic)
def update_campaign_email(
        message_id: int, message_in: schemas.CampaignEmailUpdate, db: Session = Depends(get_db)
):
    """
    Update an existing campaign email.
    """
    message = campaign_email_crud.update_campaign_email(db, message_id, message_in)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign email not found")
    return message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign_email(message_id: int, db: Session = Depends(get_db)):
    """
    Delete a campaign email.
    """
    if not campaign_email_crud.delete_campaign_email(db, message_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign email not found")
    return None
