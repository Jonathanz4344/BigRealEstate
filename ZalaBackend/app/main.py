from fastapi import FastAPI
from app.routes import csv_intake

app = FastAPI()

# Mount the route
app.include_router(csv_intake.router, prefix="/api")