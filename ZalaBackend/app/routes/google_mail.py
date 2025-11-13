from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import user as user_crud
from app.schemas import GmailSendRequest, GmailSendResponse
from app.services.gmail import send_gmail_message

router = APIRouter(prefix="/google-mail", tags=["Google Mail"])


@router.post("/send", response_model=GmailSendResponse, status_code=status.HTTP_200_OK)
def send_gmail(body: GmailSendRequest, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_id(db, body.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    return send_gmail_message(db, user, body)
