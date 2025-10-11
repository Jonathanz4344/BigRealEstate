from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()

from app.routes import csv_intake, location_filter

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Zala API is running"}


# Mount both routes under the /api prefix

app.include_router(csv_intake.router, prefix="/api")
app.include_router(location_filter.router, prefix="/api")

