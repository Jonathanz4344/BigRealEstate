from fastapi import FastAPI
from app.routes import exampleUser

app = FastAPI()
app.include_router(exampleUser.router)

