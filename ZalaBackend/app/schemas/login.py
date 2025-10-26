from pydantic import BaseModel


class Login(BaseModel):
    """
    Schema for user login
    """
    username: str
    password: str
