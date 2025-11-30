from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import uuid

from database import SessionLocal, engine
from models import Base, User
import crud
from schemas import ImageBase, RatingCreate, Token, UserCreate, UserOut, AdminCreate
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

SECRET_KEY = "SUPER_SECRET_KEY_abcdefghijklmnopqrstuxyz_SUPER_SECRET_KEY_abcdefghijklmnopqrstuxyz"   # vaihda omaan!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Serve static images
app.mount("/media", StaticFiles(directory="media"), name="media")


# Dependency: get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



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


# ---------- ADMIN: UPLOAD IMAGE ----------
@app.post("/admin/upload", response_model=ImageBase)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)   # <-- tärkeä osa
):
    # ensure images folder exists
    os.makedirs("media/images", exist_ok=True)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("media/images", filename)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    img = crud.create_image(db, filename, admin.id)
    return img


# ---------- USER: LIST IMAGES ----------
@app.get("/images", response_model=list[ImageBase])
def list_images(db: Session = Depends(get_db)):
    imgs = crud.list_images(db)
    return imgs


# ---------- USER: RATE IMAGE ----------
@app.post("/images/{image_id}/rate")
def rate_image(
    image_id: int,
    rating: RatingCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)   # tavallinen käyttäjä käy
):
    if not 1 <= rating.stars <= 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")

    img = crud.get_image(db, image_id)
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    r = crud.add_rating(db, image_id, user.id, rating.stars)
    return {"status": "ok", "rating_id": r.id}

@app.get("/images", response_model=list[ImageBase])
def list_images(db: Session = Depends(get_db)):
    return crud.list_images(db)

@app.post("/auth/register", response_model=dict)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Public endpoint — creates regular user only (is_admin always False)."""
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = crud.create_user(db, user.username, user.email, user.password, is_admin = False)

    # don't return password hash and is_admin flag
    return {"id": new_user.id, "email": new_user.email, "username": new_user.username}

@app.post("/auth/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form.username)
    if not user or not crud.verify_password(form.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}
