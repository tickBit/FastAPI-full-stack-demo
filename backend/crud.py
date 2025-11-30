from sqlalchemy.orm import Session
from models import Image, Rating
from passlib.context import CryptContext
from models import User
import bcrypt
import base64
import hashlib

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, username: str, email: str, password: str, is_admin: bool):
    password = password.encode('utf-8')
    hashed = bcrypt.hashpw(base64.b64encode(hashlib.sha256(password).digest()), bcrypt.gensalt())
    user = User(username=username, email=email, password_hash=hashed, is_admin=is_admin)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def verify_password(plain_password: str, hashed_password: str):
    plain_password = plain_password.encode('utf-8')
    hashed = bcrypt.hashpw(base64.b64encode(hashlib.sha256(plain_password).digest()), hashed_password.encode('utf-8'))
    return hashed == hashed_password.encode('utf-8')

def create_image(db: Session, filename: str, user_id: int):
    img = Image(filename=filename, uploaded_by=user_id)
    db.add(img) # only filename and uploader are stored; actual file is on disk
    db.commit()
    db.refresh(img)
    return img

def list_images(db: Session):
    return db.query(Image).all()

def add_rating(db: Session, image_id: int, user_id: int, stars: int):
    rating = Rating(image_id=image_id, user_id=user_id, stars=stars)
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating

def get_image(db: Session, image_id: int):
    return db.query(Image).filter(Image.id == image_id).first()
