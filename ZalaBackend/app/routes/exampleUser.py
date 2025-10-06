from fastapi import APIRouter
from app.models.exampleUser import User

router = APIRouter(prefix="/users", tags=["Users"])

# GET route
@router.get("/")
async def get_users():
    return [{"name": "Alice"}, {"name": "Bob"}]

# POST route
@router.post("/")
async def create_user(user: User):
    return {"message": "User created successfully", "user": user}
