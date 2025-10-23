from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.crud import lead as lead_crud
from app.schemas.property import LeadCreate, LeadUpdate, LeadPublic

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.post("/", response_model=LeadPublic, status_code=status.HTTP_201_CREATED)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    return lead_crud.create_lead(db=db, lead=lead)

@router.get("/{lead_id}", response_model=LeadPublic)
def read_lead(lead_id: int, db: Session = Depends(get_db)):
    db_lead = lead_crud.get_lead(db=db, lead_id=lead_id)
    if not db_lead:
        raise HTTPException(status_code=404, detail="lead not found")
    return db_lead

@router.get("/", response_model=List[LeadPublic])
def read_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return lead_crud.get_leads(db=db, skip=skip, limit=limit)


@router.put("/{lead_id}", response_model=LeadPublic)
def update_lead(lead_id: int, lead: LeadUpdate, db: Session = Depends(get_db)):
    db_lead = lead_crud.update_lead(db=db, lead_id=lead_id, lead=lead)
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return db_lead


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    db_lead = lead_crud.delete_lead(db=db, lead_id=lead_id)
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return db_lead
