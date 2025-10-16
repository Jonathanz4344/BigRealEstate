from sqlalchemy import String
from sqlalchemy.orm import relationship, Mapped, mapped_column
from ..db.session import Base


class UserAuthentication(Base):
    """
    SQLAlchemy model for User Authentication (user_authentication)
    """
    __tablename__ = "user_authentication"

    user_id: Mapped[int] = mapped_column(primary_key=True, ForeignKey="users.user_id")
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

    user: Mapped["User"] = relationship(back_populates="authentication")
