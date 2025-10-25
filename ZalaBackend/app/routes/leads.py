from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import lead as lead_crud
from app import schemas

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.post("/", response_model=schemas.LeadPublic, status_code=status.HTTP_201_CREATED)
def create_lead(lead_in: schemas.LeadCreate, db: Session = Depends(get_db)):
    return lead_crud.create_lead(db, lead_in)


@router.get("/", response_model=List[schemas.LeadPublic])
def read_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    db_leads = lead_crud.get_leads(db, skip=skip, limit=limit)
    results = []
    for l in db_leads:
        props = []
        for p in (l.properties or []):
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
                units.append({
                    "unit_id": u.unit_id,
                    "property_id": u.property_id,
                    "apt_num": u.apt_num,
                    "bedrooms": u.bedrooms,
                    "bath": u.bath,
                    "sqft": u.sqft,
                    "notes": u.notes,
                })

            # users = []
            # for usr in (p.users or []):
            #     users.append({
            #         "user_id": usr.user_id,
            #         "username": getattr(usr, "username", None),
            #         "profile_pic": getattr(usr, "profile_pic", None),
            #         "role": getattr(usr, "role", None),
            #     })

            props.append({
                "property_id": p.property_id,
                "property_name": getattr(p, "property_name", None),
                "mls_number": getattr(p, "mls_number", None),
                "notes": getattr(p, "notes", None),
                "address_id": p.address.address_id if getattr(p, "address", None) else None,
                "address": addr,
                "units": units,
                # "users": users,
            })

        results.append({
            "lead_id": l.lead_id,
            "person_type": l.person_type,
            "business": l.business,
            "website": l.website,
            "license_num": l.license_num,
            "notes": l.notes,
            "created_by": l.created_by,
            "contact_id": l.contact_id,
            "properties": props,
        })
    return results


@router.get("/{lead_id}", response_model=schemas.LeadPublic)
def read_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = lead_crud.get_lead_by_id(db, lead_id=lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
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
            units.append({
                "unit_id": u.unit_id,
                "property_id": u.property_id,
                "apt_num": u.apt_num,
                "bedrooms": u.bedrooms,
                "bath": u.bath,
                "sqft": u.sqft,
                "notes": u.notes,
            })

        # users = []
        # for usr in (p.users or []):
        #     users.append({
        #         "user_id": usr.user_id,
        #         "username": getattr(usr, "username", None),
        #         "profile_pic": getattr(usr, "profile_pic", None),
        #         "role": getattr(usr, "role", None),
        #     })

        props.append({
            "property_id": p.property_id,
            "property_name": getattr(p, "property_name", None),
            "mls_number": getattr(p, "mls_number", None),
            "notes": getattr(p, "notes", None),
            "address_id": p.address.address_id if getattr(p, "address", None) else None,
            "address": addr,
            "units": units,
            # "users": users,
        })

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


@router.put("/{lead_id}", response_model=schemas.LeadPublic)
def update_lead(lead_id: int, lead_in: schemas.LeadUpdate, db: Session = Depends(get_db)):
    lead = lead_crud.update_lead(db, lead_id=lead_id, lead_in=lead_in)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    ok = lead_crud.delete_lead(db, lead_id=lead_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return None


@router.post("/{lead_id}/properties/{property_id}", response_model=schemas.LeadPublic)
def link_property(lead_id: int, property_id: int, db: Session = Depends(get_db)):
    updated = lead_crud.link_property_to_lead(db, lead_id=lead_id, property_id=property_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead or Property not found")
    lead = lead_crud.get_lead_by_id(db, lead_id=lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found after update")
    # reuse read_lead serialization
    return read_lead(lead_id, db)


@router.delete("/{lead_id}/properties/{property_id}", response_model=schemas.LeadPublic)
def unlink_property(lead_id: int, property_id: int, db: Session = Depends(get_db)):
    updated = lead_crud.unlink_property_from_lead(db, lead_id=lead_id, property_id=property_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead or Property not found")
    return read_lead(lead_id, db)


@router.post("/{lead_id}/users/{user_id}", response_model=schemas.LeadPublic)
def link_user(lead_id: int, user_id: int, db: Session = Depends(get_db)):
    updated = lead_crud.link_user_to_lead(db, lead_id=lead_id, user_id=user_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead or User not found")
    return read_lead(lead_id, db)


@router.delete("/{lead_id}/users/{user_id}", response_model=schemas.LeadPublic)
def unlink_user(lead_id: int, user_id: int, db: Session = Depends(get_db)):
    updated = lead_crud.unlink_user_from_lead(db, lead_id=lead_id, user_id=user_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead or User not found")
    return read_lead(lead_id, db)
