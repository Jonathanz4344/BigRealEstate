from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv


load_dotenv()

from app.routes import (
    csv_intake,
    location_filter,
    contacts,
    addresses,
    properties,
    users,
    units,
    leads,
    auth,
    campaigns,
    campaign_leads,
    campaign_emails,
    google_mail,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"], include_in_schema=False)
def read_root():
    return {"message": "Zala API is running"}


# Mount all routes under the /api prefix
app.include_router(users.public_router, prefix="/api")  # signup
app.include_router(auth.router, prefix="/api")  # Login with google signin
app.include_router(
    location_filter.router, prefix="/api", include_in_schema=True
)  # search leads
app.include_router(
    google_mail.router, prefix="/api", include_in_schema=True
)  # Google Mail Integration

app.include_router(
    campaign_emails.send_router, prefix="/api", include_in_schema=True
)  # Send Campaign Email
app.include_router(campaign_emails.router, prefix="/api", include_in_schema=True)

app.include_router(campaigns.router, prefix="/api", include_in_schema=False)
app.include_router(leads.router, prefix="/api", include_in_schema=True)
app.include_router(users.router, prefix="/api", include_in_schema=False)

app.include_router(campaign_leads.router, prefix="/api", include_in_schema=False)
app.include_router(addresses.router, prefix="/api", include_in_schema=False)
app.include_router(properties.router, prefix="/api", include_in_schema=False)
app.include_router(units.router, prefix="/api", include_in_schema=False)
app.include_router(contacts.router, prefix="/api", include_in_schema=False)
app.include_router(csv_intake.router, prefix="/api", include_in_schema=False)
