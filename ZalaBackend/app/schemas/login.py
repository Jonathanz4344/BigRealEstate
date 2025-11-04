from pydantic import BaseModel


class Login(BaseModel):
    """
    Schema for user login
    """
    username: str
    password: str


class GoogleLogin(BaseModel):
    """
    Schema for Google Sign-In
    """
    id_token: str
