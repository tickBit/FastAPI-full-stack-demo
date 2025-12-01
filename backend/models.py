from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from database import Base
from sqlalchemy import Boolean

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    is_admin = Column(Boolean, default=False)

class Image(Base):
    __tablename__ = "images"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str]
    description: Mapped[str | None]
    uploaded_at: Mapped[datetime] = mapped_column(default=datetime.now)
    
    # relationship to ratings
    ratings: Mapped[list["Rating"]] = relationship("Rating", back_populates="image")


class Rating(Base):
    __tablename__ = "rating"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    image_id: Mapped[int] = mapped_column(ForeignKey("images.id"))
    stars: Mapped[int]
    
    # relationship back to image
    image: Mapped["Image"] = relationship("Image", back_populates="ratings")
