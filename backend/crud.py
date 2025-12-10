from sqlalchemy.orm import Session
from models import Image, Rating
from passlib.context import CryptContext
from models import User


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, username: str, email: str, password_hash: str, is_admin: bool):
    user = User(username=username, email=email, password_hash=password_hash, is_admin=is_admin)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_image(db: Session, filename: str, description: str):
    img = Image(filename=filename, description=description)
    db.add(img) # only filename and uploader are stored; actual file is on disk
    db.commit()
    db.refresh(img)
    return img

def list_images(db: Session):
    return db.query(Image).all()

def add_or_update_rating(db: Session, image_id: int, user_id: int, stars: int):
    existing = db.query(Rating).filter(
        Rating.image_id == image_id,
        Rating.user_id == user_id
    ).first()

    if existing:
        existing.stars = stars
        db.commit()
        db.refresh(existing)
        return existing

    new_rating = Rating(image_id=image_id, user_id=user_id, stars=stars)
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating


def get_image(db: Session, image_id: int):
    return db.query(Image).filter(Image.id == image_id).first()

def get_ratings(db: Session, image_id):
    return db.query(Rating).filter(Rating.image_id == image_id).all()


def delete_image(db: Session, image_id: int):
    img = db.query(Image).filter(Image.id == image_id).first()
    if img:
        db.delete(img)
        db.commit()