# from fastapi import APIRouter, UploadFile, File, Depends
# from fastapi.responses import JSONResponse
# from sqlalchemy.orm import Session
# import pandas as pd
# import io

# from app.models.contact import Contact
# from app.models.lead import Lead
# from app.db.session import get_db  # define get_db in db/session.py

# router = APIRouter()

# @router.post("/import-csv/")
# async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
#     if file.content_type not in ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
#         return JSONResponse(status_code=400, content={"error": "Unsupported file type"})

#     try:
#         contents = await file.read()

#         # Read file into DataFrame
#         if file.filename.endswith(".xlsx"):
#             df = pd.read_excel(io.BytesIO(contents))
#         else:
#             df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

#         # Normalize column names
#         df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

#         leads = []
#         for _, row in df.iterrows():
#             # Create Contact
#             contact = Contact(
#                 first_name=row.get("first_name", ""),
#                 last_name=row.get("last_name", ""),
#                 email=row.get("email", ""),
#                 phone=row.get("phone_number", "")
#             )
#             db.add(contact)
#             db.flush()  # ensures contact_id is available

#             # Create Lead linked to Contact
#             lead = Lead(
#                 contact_id=contact.contact_id,
#                 person_type=row.get("person_type"),
#                 business=row.get("business"),
#                 website=row.get("website"),
#                 license_num=row.get("license_num"),
#                 notes=row.get("notes"),
#                 created_by=None  # or set to a user_id if available
#             )
#             db.add(lead)
#             leads.append(lead)

#         db.commit()

#         return {
#             "message": f"Successfully imported {len(leads)} leads",
#             "parsed_data": [lead.lead_id for lead in leads]
#         }

#     except Exception as e:
#         db.rollback()
#         return JSONResponse(status_code=500, content={"error": f"Parsing failed: {str(e)}"})


from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import pandas as pd
import io

router = APIRouter()

@router.post("/import-csv/")
async def import_csv(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type not in [
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ]:
        return JSONResponse(status_code=400, content={"error": "Unsupported file type"})

    try:
        contents = await file.read()

        # Read file into DataFrame
        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

        # Normalize column names
        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

        # Parse each row into a dict
        parsed_data = []
        for _, row in df.iterrows():
            parsed_data.append({
                "first_name": row.get("first_name", ""),
                "last_name": row.get("last_name", ""),
                "email": row.get("email", ""),
                "phone_number": row.get("phone_number", ""),
                "person_type": row.get("person_type", None),
                "business": row.get("business", None),
                "website": row.get("website", None),
                "license_num": row.get("license_num", None),
                "notes": row.get("notes", None),
            })

        return {
            "message": f"Successfully parsed {len(parsed_data)} leads",
            "parsed_data": parsed_data
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Parsing failed: {str(e)}"})