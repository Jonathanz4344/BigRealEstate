from typing import Any, Dict, Optional, Tuple

import io

import pandas as pd
from fastapi import APIRouter, Depends, File, UploadFile, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.contact import Contact
from app.models.lead import Lead


router = APIRouter(tags=["Import CSV"])


def _normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]
    return df


def _get_cell(row: Dict[str, Any], key: str) -> Optional[str]:
    value = row.get(key)
    if value is None:
        return None
    if isinstance(value, float) and pd.isna(value):
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    try:
        if pd.isna(value):
            return None
    except TypeError:
        pass
    return str(value)


def _get_person_type(row: Dict[str, Any]) -> str:
    raw = _get_cell(row, "person_type")
    if not raw:
        return "csv"
    normalized = raw.lower().replace("_", " ").strip()
    allowed = {
        "csv": "csv",
        "rapidapi": "rapidapi",
        "google places": "google places",
    }
    return allowed.get(normalized, "csv")


def _find_existing_contact(
    db: Session,
    email: Optional[str],
    phone: Optional[str],
) -> Optional[Contact]:
    contact = None
    if email:
        contact = db.query(Contact).filter(Contact.email == email).first()
    if not contact and phone:
        contact = db.query(Contact).filter(Contact.phone == phone).first()
    return contact


def _get_or_create_contact(
    db: Session,
    contact_data: Dict[str, Optional[str]],
) -> Tuple[Contact, str]:
    existing_contact = _find_existing_contact(
        db,
        contact_data.get("email"),
        contact_data.get("phone"),
    )
    if existing_contact:
        status = "unchanged"
        for field, value in contact_data.items():
            if value and getattr(existing_contact, field) != value:
                setattr(existing_contact, field, value)
                status = "updated"
        if status == "updated":
            db.add(existing_contact)
        return existing_contact, status

    contact = Contact(
        first_name=contact_data["first_name"],
        last_name=contact_data.get("last_name"),
        email=contact_data.get("email"),
        phone=contact_data.get("phone"),
    )
    db.add(contact)
    db.flush()
    return contact, "created"


def _get_or_create_lead(
    db: Session,
    contact_id: Optional[int],
    lead_data: Dict[str, Optional[str]],
) -> Tuple[Lead, str]:
    existing_lead = None
    if contact_id:
        existing_lead = db.query(Lead).filter(Lead.contact_id == contact_id).first()

    if existing_lead:
        status = "unchanged"
        for field, value in lead_data.items():
            if value is not None and getattr(existing_lead, field) != value:
                setattr(existing_lead, field, value)
                status = "updated"
        if status == "updated":
            db.add(existing_lead)
        return existing_lead, status

    lead = Lead(
        contact_id=contact_id,
        person_type=lead_data.get("person_type"),
        business=lead_data.get("business"),
        website=lead_data.get("website"),
        license_num=lead_data.get("license_num"),
        notes=lead_data.get("notes"),
    )
    db.add(lead)
    db.flush()
    return lead, "created"


@router.post("/import-csv/", tags=["Import CSV"])
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    allowed_types = {
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    if file.content_type not in allowed_types:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Unsupported file type"},
        )

    contents = await file.read()

    try:
        if file.filename.lower().endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": f"Failed to parse file: {exc}"},
        )

    df = _normalize_headers(df)
    rows = df.to_dict(orient="records")

    results = {
        "contacts_created": [],
        "contacts_updated": [],
        "contacts_unchanged": [],
        "leads_created": [],
        "leads_updated": [],
        "leads_unchanged": [],
        "skipped": [],
        "errors": [],
    }

    for index, row in enumerate(rows, start=1):
        first_name = _get_cell(row, "first_name")
        if not first_name:
            results["skipped"].append({"row": index, "reason": "Missing first_name"})
            continue

        contact_data = {
            "first_name": first_name,
            "last_name": _get_cell(row, "last_name"),
            "email": _get_cell(row, "email"),
            "phone": _get_cell(row, "phone_number") or _get_cell(row, "phone"),
        }

        lead_data = {
            "person_type": _get_person_type(row),
            "business": _get_cell(row, "business"),
            "website": _get_cell(row, "website"),
            "license_num": _get_cell(row, "license_num"),
            "notes": _get_cell(row, "notes"),
        }

        try:
            contact, contact_status = _get_or_create_contact(db, contact_data)
            lead, lead_status = _get_or_create_lead(db, contact.contact_id, lead_data)
            db.commit()

            if contact_status == "created":
                results["contacts_created"].append(contact.contact_id)
            elif contact_status == "updated":
                results["contacts_updated"].append(contact.contact_id)
            else:
                results["contacts_unchanged"].append(contact.contact_id)

            if lead_status == "created":
                results["leads_created"].append(lead.lead_id)
            elif lead_status == "updated":
                results["leads_updated"].append(lead.lead_id)
            else:
                results["leads_unchanged"].append(lead.lead_id)
        except Exception as exc:
            db.rollback()
            results["errors"].append({"row": index, "error": str(exc)})

    summary = {
        "message": f"Processed {len(rows)} rows",
        "contacts_created_count": len(results["contacts_created"]),
        "contacts_updated_count": len(results["contacts_updated"]),
        "leads_created_count": len(results["leads_created"]),
        "leads_updated_count": len(results["leads_updated"]),
        "skipped_count": len(results["skipped"]),
        "error_count": len(results["errors"]),
    }

    return {**summary, **results}
