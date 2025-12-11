from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Form
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import uuid
from dotenv import load_dotenv
from typing import Annotated
from database import SessionLocal, engine
from models import Base, User, Image, ImageOut, Rating, RatingOut
import crud
from schemas import ImageBase, RatingCreate, UserCreate
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pwdlib import PasswordHash

load_dotenv()

password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static images
app.mount("/media", StaticFiles(directory="media"), name="media")


# Dependency: get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
    except JWTError:
        raise HTTPException(401, "Invalid token")

    user = crud.get_user_by_username(db, username)
    if not user:
        raise HTTPException(401, "User not found")

    return user


def get_admin_user(current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(403, "Admins only")
    return current_user

# Admin: delete pic

@app.delete("/admin/delete/{image_id}")
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)   # <-- tärkeä osa
):
    if not admin.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")

    img = crud.get_image(db, image_id)
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    # delete image file
    filepath = os.path.join("media/images", img.filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    crud.delete_image(db, image_id)
    return {"status": "ok"}

# ---------- ADMIN: UPLOAD IMAGE ----------
@app.post("/admin/upload", response_model=ImageBase)
async def upload_image(
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    description: Annotated[str | None, Form()] = None,
    admin: User = Depends(get_admin_user)   # <-- tärkeä osa
):
    # ensure images folder exists
    os.makedirs("media/images", exist_ok=True)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("media/images", filename)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    img = crud.create_image(db, filename, description)
    return img


# ---------- USER: LIST IMAGES ----------
@app.get("/images", response_model=list[dict])
def list_images(db: Session = Depends(get_db)):
    imgs = crud.list_images(db)
    
    arr = []
    for img in imgs:
        avg_rating = db.query(func.avg(Rating.stars)).filter(Rating.image_id == img.id).scalar()
        arr.append({"id": img.id, "filename": img.filename ,"average_rating": avg_rating, "description": img.description })
    return arr

@app.get("/images/{image_id}", response_model=ImageOut)
def get_image(image_id: int, db: Session = Depends(get_db)):
    img = db.query(Image).filter(Image.id == image_id).first()

    if not img:
        raise HTTPException(404, "Image not found")

    avg_rating = db.query(func.avg(Rating.stars)).filter(Rating.image_id == image_id).scalar()
    count = db.query(func.count(Rating.id)).filter(Rating.image_id == image_id).scalar()

    return {
        "id": img.id,
        "filename": img.filename,
        "description": img.description,
        "average_rating": round(avg_rating, 1) if avg_rating else None,
        "total_ratings": count
    }

# ---------- USER: RATE IMAGE ----------
@app.post("/images/rate/{image_id}", response_model=dict)
def rate_image(
    image_id: int,
    rating: RatingCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not 1 <= rating.stars <= 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")

    img = crud.get_image(db, image_id)
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    r = crud.add_or_update_rating(db, image_id, user.id, rating.stars)

    return {"status": "ok", "rating_id": r.id, "updated": True}

@app.get("/images/{image_id}/ratings", response_model=list[RatingOut])
def get_ratings(image_id: int, db: Session = Depends(get_db)):
    ratings = db.query(Rating).filter(Rating.image_id == image_id).all()
    return ratings


@app.post("/auth/register", response_model=dict)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Public endpoint — creates regular user only (is_admin always False)."""
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = crud.create_user(db, user.username, user.email, password_hash.hash(user.password), is_admin = False)

    token = create_access_token({"sub": new_user.username})
    
    # don't return password hash and is_admin flag
    return {"id": new_user.id, "email": new_user.email, "username": new_user.username, "token": token}

@app.post("/auth/login", response_model=dict)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form.username)
    
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "is_admin": str(user.is_admin)}

@app.put("/update/{image_id}")
def update_image(
    image_id: int,
    description: str = Form(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    if admin.is_admin is False:
        raise HTTPException(status_code=403, detail="Admins only")
    
    img = crud.get_image(db, image_id)
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    img.description = description
    db.commit()
    db.refresh(img)
    return img