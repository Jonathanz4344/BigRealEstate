from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.lead import Lead
import pandas as pd
import io

router = APIRouter()

@router.post("/import-csv/")
async def import_csv(file: UploadFile = File(...)):
    if file.content_type not in ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    try:
        contents = await file.read()

        # Read file into DataFrame
        if file.filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

        # Normalize column names
        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

        # Validate and parse each row
        leads = []
        for _, row in df.iterrows():
            lead_data = {
                "first_name": row.get("first_name", ""),
                "last_name": row.get("last_name", ""),
                "email": row.get("email", ""),
                "phone_number": row.get("phone_number", "")
            }
            lead = Lead(**lead_data)
            leads.append(lead)

            # Optional: raw SQL insert (commented out)
            # import psycopg2
            # conn = psycopg2.connect("your_connection_string")
            # cur = conn.cursor()
            # cur.execute("""
            #     INSERT INTO leads (first_name, last_name, email, phone_number)
            #     VALUES (%s, %s, %s, %s)
            # """, (lead.first_name, lead.last_name, lead.email, lead.phone_number))
            # conn.commit()
            # cur.close()
            # conn.close()

        return {
            "message": f"Successfully parsed {len(leads)} leads",
            "parsed_data": [lead.dict() for lead in leads]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")