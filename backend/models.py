from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from database import Base
from sqlalchemy import Boolean

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str]
    email: Mapped[str]
    password_hash: Mapped[str]
    is_admin: Mapped[bool]
    
    ratings: Mapped[list["Rating"]] = relationship(
        "Rating",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Image(Base):
    __tablename__ = "images"

    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str]
    description: Mapped[str | None]
    uploaded_at: Mapped[datetime] = mapped_column(default=datetime.now)

    ratings: Mapped[list["Rating"]] = relationship(
        "Rating",
        back_populates="image",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Rating(Base):
    __tablename__ = "rating"

    id: Mapped[int] = mapped_column(primary_key=True)
    image_id: Mapped[int] = mapped_column(
        ForeignKey("images.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    stars: Mapped[int]

    user: Mapped["User"] = relationship(
        "User",
        back_populates="ratings"
    )

    image: Mapped["Image"] = relationship(
        "Image",
        back_populates="ratings"
    )


class RatingOut(BaseModel):
    id: int
    user_id: int
    stars: int

    class Config:
        orm_mode = True


class ImageOut(BaseModel):
    id: int
    filename: str
    description: str | None
    average_rating: float | None
    total_ratings: int

    class Config:
        orm_mode = True
