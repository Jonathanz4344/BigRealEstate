from pydantic import BaseModel, model_validator


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
    code: str | None = None
    id_token: str | None = None
    scope: str | None = None

    @model_validator(mode="after")
    def _require_token_or_code(self):
        if not self.code and not self.id_token:
            raise ValueError("Either authorization code or id_token must be provided.")
        return self
