from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv()

from app.routes import csv_intake, location_filter, contacts, addresses, properties, users, units, leads

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Zala API is running"}


# Mount all routes under the /api prefix
app.include_router(csv_intake.router, prefix="/api")
app.include_router(location_filter.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(contacts.router, prefix="/api") 
app.include_router(addresses.router, prefix="/api")
app.include_router(properties.router, prefix="/api")
app.include_router(units.router, prefix="/api")
app.include_router(leads.router, prefix="/api")


