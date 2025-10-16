from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv()

from app.routes import csv_intake, location_filter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Zala API is running"}


# Mount both routes under the /api prefix

app.include_router(csv_intake.router, prefix="/api")
app.include_router(location_filter.router, prefix="/api")

