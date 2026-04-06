from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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
    board,
    board_step,
    team,
    auth,
    campaigns,
    campaign_leads,
    campaign_emails,
    google_mail,
    smtp,
    notifications,
    websocket,
    email_verification,
    team_deals,
    user_tutorials
)
from app.services.file_storage import get_upload_root

app = FastAPI(redirect_slashes=False)

uploads_path = get_upload_root()
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"], include_in_schema=True)
def read_root():
    return {"message": "Zala API is running"}


# Mount all routes under the /api prefix
app.include_router(users.public_router, prefix="/api")  # signup
app.include_router(email_verification.router, prefix="/api")  # email verification
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
app.include_router(campaign_leads.router, prefix="/api", include_in_schema=True)
app.include_router(team.router, prefix="/api", include_in_schema=True)
app.include_router(team_deals.router, prefix="/api", include_in_schema=True)

app.include_router(campaigns.router, prefix="/api", include_in_schema=True)

app.include_router(addresses.router, prefix="/api", include_in_schema=True)
app.include_router(properties.router, prefix="/api", include_in_schema=True)
app.include_router(properties.properties_public, prefix="/api", include_in_schema=True)
app.include_router(units.router, prefix="/api", include_in_schema=True)
app.include_router(leads.router, prefix="/api", include_in_schema=True)

app.include_router(board.router, prefix="/api", include_in_schema=True)
app.include_router(board_step.router, prefix="/api", include_in_schema=True)

app.include_router(users.router, prefix="/api", include_in_schema=True)
app.include_router(contacts.router, prefix="/api", include_in_schema=True)

app.include_router(csv_intake.router, prefix="/api", include_in_schema=True)

# SMTP Email routes
app.include_router(smtp.router, prefix="/api", include_in_schema=True)

# Notifications routes
app.include_router(notifications.router, prefix="/api", include_in_schema=True)

# WebSocket routes (no /api prefix for WebSocket)
app.include_router(websocket.router, include_in_schema=True)

app.include_router(user_tutorials.router, prefix="/api", include_in_schema=True)
