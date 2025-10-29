from typing import Optional

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from ..db.session import Base


class UserAuthentication(Base):
    """
    SQLAlchemy model for User Authentication (user_authentication)
    """
    __tablename__ = "user_authentication"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), primary_key=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(50), nullable=False, default="local")
    provider_subject: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True)
    provider_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user: Mapped["User"] = relationship(back_populates="authentication")
