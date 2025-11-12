import json
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.db.crud import campaign as campaign_crud
from app.models.campaign import Campaign
from app.models.campaign_email import CampaignEmail
from app.models.campaign_lead import CampaignLead
from app.models.lead import Lead
from app.services.gmail import send_gmail_message


def _base_query(db: Session):
    return db.query(CampaignEmail).options(
        joinedload(CampaignEmail.campaign).joinedload(Campaign.user),
        joinedload(CampaignEmail.campaign).selectinload(Campaign.leads),
        joinedload(CampaignEmail.lead),
    )


def _normalize_error_detail(detail) -> str:
    if detail is None:
        return "Unknown error"
    if isinstance(detail, str):
        return detail
    try:
        return json.dumps(detail)
    except TypeError:
        return str(detail)


def get_campaign_email(db: Session, message_id: int) -> Optional[CampaignEmail]:
    """
    Fetch a single campaign message.
    """
    return (
        _base_query(db)
        .filter(CampaignEmail.message_id == message_id)
        .first()
    )


def get_campaign_emails(db: Session, skip: int = 0, limit: int = 100) -> List[CampaignEmail]:
    """
    Fetch multiple campaign messages.
    """
    return (
        _base_query(db)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_campaign_emails_for_campaign(
        db: Session,
        campaign_id: int,
        skip: int = 0,
        limit: int = 100,
) -> List[CampaignEmail]:
    """
    Fetch messages for a given campaign.
    """
    query = _base_query(db).filter(CampaignEmail.campaign_id == campaign_id)

    return query.offset(skip).limit(limit).all()


def get_campaign_emails_by_lead(
        db: Session,
        campaign_id: int,
        lead_id: int,
        skip: int = 0,
        limit: int = 100,
) -> List[CampaignEmail]:
    """
    Fetch emails for a given campaign and lead.
    """
    query = _base_query(db).filter(CampaignEmail.campaign_id == campaign_id, CampaignEmail.lead_id == lead_id)

    return query.offset(skip).limit(limit).all()


def create_campaign_email(db: Session, message_in: schemas.CampaignEmailCreate) -> CampaignEmail:
    """
    Create and persist a campaign message.
    """
    payload = message_in.model_dump()
    db_message = CampaignEmail(**payload)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def send_campaign_email(db: Session, message_in: schemas.CampaignEmailSendRequest) -> schemas.CampaignEmailSendResponse:
    """
    Send a campaign email to multiple leads via Gmail and return per-lead results with the hydrated campaign.
    """
    lead_ids = list(dict.fromkeys(message_in.lead_id or []))
    if not lead_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="lead_id must include at least one lead id.",
        )

    campaign = campaign_crud.get_campaign(db, message_in.campaign_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    if not campaign.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Campaign owner is required to send emails.",
        )

    campaign_leads = (
        db.query(CampaignLead)
        .options(joinedload(CampaignLead.lead).joinedload(Lead.contact))
        .filter(
            CampaignLead.campaign_id == message_in.campaign_id,
            CampaignLead.lead_id.in_(lead_ids),
        )
        .all()
    )
    linked_ids = {link.lead_id for link in campaign_leads}
    missing_links = sorted(set(lead_ids) - linked_ids)
    if missing_links:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lead IDs not linked to this campaign: {missing_links}",
        )

    results: List[schemas.CampaignEmailSendResult] = []

    for link in campaign_leads:
        lead = link.lead
        contact = lead.contact if lead else None
        to_email = contact.email if contact and contact.email else None
        status_value = schemas.CampaignEmailStatus.FAILED
        gmail_message_id = None
        gmail_thread_id = None
        error_detail = None

        if not to_email:
            error_detail = "Lead is missing a contact email."
        else:
            gmail_request = schemas.GmailSendRequest(
                user_id=campaign.user.user_id,
                to=to_email,
                subject=message_in.message_subject,
                html=message_in.message_body,
                from_name=message_in.from_name,
            )
            try:
                gmail_response = send_gmail_message(db, campaign.user, gmail_request)
                status_value = schemas.CampaignEmailStatus.SENT
                gmail_message_id = gmail_response.id
                gmail_thread_id = gmail_response.thread_id
                link.email_contacted = True
            except HTTPException as exc:
                error_detail = _normalize_error_detail(exc.detail)
            except Exception as exc:  # pragma: no cover - defensive
                error_detail = str(exc)

        db_message = CampaignEmail(
            campaign_id=message_in.campaign_id,
            lead_id=link.lead_id,
            message_subject=message_in.message_subject,
            message_body=message_in.message_body,
            from_name=message_in.from_name,
            to_email=to_email,
            gmail_message_id=gmail_message_id,
            gmail_thread_id=gmail_thread_id,
            send_status=status_value.value,
            error_detail=error_detail,
        )
        db.add(db_message)
        db.flush()

        results.append(
            schemas.CampaignEmailSendResult(
                lead_id=link.lead_id,
                to_email=to_email,
                status=status_value,
                error_detail=error_detail,
                message_id=db_message.message_id,
            )
        )

    db.commit()
    campaign = campaign_crud.get_campaign(db, message_in.campaign_id)

    return schemas.CampaignEmailSendResponse(campaign=campaign, results=results)


def update_campaign_email(
        db: Session, message_id: int, message_in: schemas.CampaignEmailUpdate
) -> Optional[CampaignEmail]:
    """
    Update a campaign message.
    """
    db_message = db.query(CampaignEmail).filter(CampaignEmail.message_id == message_id).first()
    if not db_message:
        return None

    for field, value in message_in.model_dump(exclude_unset=True).items():
        setattr(db_message, field, value)

    db.commit()
    db.refresh(db_message)
    return db_message


def delete_campaign_email(db: Session, message_id: int) -> bool:
    """
    Delete a campaign message.
    """
    db_message = db.query(CampaignEmail).filter(CampaignEmail.message_id == message_id).first()
    if not db_message:
        return False

    db.delete(db_message)
    db.commit()
    return True
