from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import schemas
from app.db.crud import campaign_email as campaign_email_crud
from app.db.session import get_db


router = APIRouter(prefix="/campaign-emails", tags=["Send Campaign Email"])


@router.post(
    "/send",
    summary="Send Campaign Email",
    response_model=schemas.CampaignPublic,
    status_code=status.HTTP_200_OK,
)
def send_campaign_email(
    message_in: schemas.CampaignEmailSendRequest,
    db: Session = Depends(get_db),
):
    """
    Send a campaign email template to multiple leads and return the hydrated campaign.
    """
    return campaign_email_crud.send_campaign_email(db, message_in)
