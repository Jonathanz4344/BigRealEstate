from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import lead as lead_crud
from app import schemas
from app.models.lead import Lead

router = APIRouter(prefix="/leads")


def _serialize_lead(lead: Lead) -> dict:
    props = []
    for p in (lead.properties or []):
        addr = None
        if getattr(p, "address", None):
            addr = {
                "address_id": p.address.address_id,
                "street_1": p.address.street_1,
                "street_2": p.address.street_2,
                "city": p.address.city,
                "state": p.address.state,
                "zipcode": p.address.zipcode,
                "lat": p.address.lat,
                "long": p.address.long,
            }

        units = []
        for u in (p.units or []):
            units.append(
                {
                    "unit_id": u.unit_id,
                    "property_id": u.property_id,
                    "apt_num": u.apt_num,
                    "bedrooms": u.bedrooms,
                    "bath": u.bath,
                    "sqft": u.sqft,
                    "notes": u.notes,
                }
            )

        props.append(
            {
                "property_id": p.property_id,
                "property_name": getattr(p, "property_name", None),
                "mls_number": getattr(p, "mls_number", None),
                "notes": getattr(p, "notes", None),
                "address_id": p.address.address_id if getattr(p, "address", None) else None,
                "address": addr,
                "units": units,
            }
        )

    created_by_user = None
    if getattr(lead, "created_by_user", None):
        u = lead.created_by_user
        created_by_user = {
            "user_id": u.user_id,
            "username": getattr(u, "username", None),
            "profile_pic": getattr(u, "profile_pic", None),
            "role": getattr(u, "role", None),
        }

    contact = None
    if getattr(lead, "contact", None):
        c = lead.contact
        contact = {
            "contact_id": c.contact_id,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "email": c.email,
            "phone": c.phone,
        }

    return {
        "lead_id": lead.lead_id,
        "person_type": lead.person_type,
        "business": lead.business,
        "website": lead.website,
        "license_num": lead.license_num,
        "notes": lead.notes,
        "created_by": lead.created_by,
        "created_by_user": created_by_user,
        "contact_id": lead.contact_id,
        "contact": contact,
        "properties": props,
    }


@router.post("/",tags=["Leads"], response_model=schemas.LeadPublic, status_code=status.HTTP_201_CREATED)
def create_lead(lead_in: schemas.LeadCreate, db: Session = Depends(get_db)):
    return lead_crud.create_lead(db, lead_in)


@router.get("/", tags=["Leads"],summary="Get All Leads", response_model=List[schemas.LeadPublic])
def list_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    leads = lead_crud.get_leads(db, skip=skip, limit=limit)
    return [_serialize_lead(lead) for lead in leads]


@router.get("/{lead_id}", tags=["Leads"],summary="Read Lead By Id", response_model=schemas.LeadPublic)
def read_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = lead_crud.get_lead_by_id(db, lead_id=lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return _serialize_lead(lead)


@router.put("/{lead_id}",tags=["Leads"], response_model=schemas.LeadPublic)
def update_lead(lead_id: int, lead_in: schemas.LeadUpdate, db: Session = Depends(get_db)):
    lead = lead_crud.update_lead(db, lead_id=lead_id, lead_in=lead_in)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


@router.delete("/{lead_id}",tags=["Leads"], status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    ok = lead_crud.delete_lead(db, lead_id=lead_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return None


@router.post("/{lead_id}/properties/{property_id}",tags=["Leads Properties Link"], response_model=schemas.LeadPublic)
def link_property(lead_id: int, property_id: int, db: Session = Depends(get_db)):
    updated = lead_crud.link_property_to_lead(db, lead_id=lead_id, property_id=property_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead or Property not found")
    lead = lead_crud.get_lead_by_id(db, lead_id=lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found after update")
    # reuse read_lead serialization
    return read_lead(lead_id, db)


@router.delete("/{lead_id}/properties/{property_id}",tags=["Leads Properties Link"], response_model=schemas.LeadPublic)
def unlink_property(lead_id: int, property_id: int, db: Session = Depends(get_db)):
    updated = lead_crud.unlink_property_from_lead(db, lead_id=lead_id, property_id=property_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead or Property not found")
    return read_lead(lead_id, db)


@router.post("/{lead_id}/users/{user_id}",tags=["Leads Users Link"], response_model=schemas.LeadPublic)
def link_user(lead_id: int, user_id: int, db: Session = Depends(get_db)):
    updated = lead_crud.link_user_to_lead(db, lead_id=lead_id, user_id=user_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead or User not found")
    return read_lead(lead_id, db)


@router.delete("/{lead_id}/users/{user_id}", tags=["Leads Users Link"], response_model=schemas.LeadPublic)
def unlink_user(lead_id: int, user_id: int, db: Session = Depends(get_db)):
    updated = lead_crud.unlink_user_from_lead(db, lead_id=lead_id, user_id=user_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead or User not found")
    return read_lead(lead_id, db)


@router.post("/{lead_id}/contacts/{contact_id}", tags=["Leads Contacts Link"], response_model=schemas.LeadPublic)
def link_contact(lead_id: int, contact_id: int, db: Session = Depends(get_db)):
    updated = lead_crud.link_contact_to_lead(db, lead_id=lead_id, contact_id=contact_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead or Contact not found")
    return read_lead(lead_id, db)


@router.delete("/{lead_id}/contacts/{contact_id}", tags=["Leads Contacts Link"], response_model=schemas.LeadPublic)
def unlink_contact(lead_id: int, contact_id: int, db: Session = Depends(get_db)):
    updated = lead_crud.unlink_contact_from_lead(db, lead_id=lead_id, contact_id=contact_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead or Contact not found")
    return read_lead(lead_id, db)
