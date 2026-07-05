from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str | None = None
    # is_admin: bool # removed from public schema
class AdminCreate(UserCreate):
    """Admin-only schema — allows is_admin flag."""
    pass  # Inherits email, password, name; is_admin set server-side

class UserResponse(BaseModel):
    id: int
    email: str
    username: str | None
    is_admin: bool
    
class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ImageBase(BaseModel):
    id: int
    filename: str
    description: str | None
    uploaded_at: datetime
    average_rating: float | None = None  # add this
    total_ratings: int = 0  # add this
    
    model_config = ConfigDict(from_attributes=True)


class RatingCreate(BaseModel):
    stars: int

class RatingOut(BaseModel):
    id: int
    stars: int

    model_config = ConfigDict(from_attributes=True)