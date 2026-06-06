import os
import bcrypt as _bcrypt
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import get_db
from models import User

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET", "learnfast-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

security = HTTPBearer(auto_error=False)


def _hash(pw: str) -> str:
    return _bcrypt.hashpw(pw.encode(), _bcrypt.gensalt()).decode()


def _verify(pw: str, hashed: str) -> bool:
    return _bcrypt.checkpw(pw.encode(), hashed.encode())


def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    return db.query(User).filter(User.id == user_id).first()


def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    return get_current_user(credentials, db)


class RegisterRequest(BaseModel):
    email: str
    password: str
    display_name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    google_id: str
    email: str
    display_name: str = ""
    avatar_url: str = ""


class AuthResponse(BaseModel):
    token: str
    user: dict


@router.post("/auth/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=req.email,
        display_name=req.display_name or req.email.split("@")[0],
        hashed_password=_hash(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.id})
    return AuthResponse(
        token=token,
        user={"id": user.id, "email": user.email, "display_name": user.display_name, "xp": user.xp, "level": user.level,
              "achievements": user.achievements or []},
    )


@router.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not _verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.id})
    return AuthResponse(
        token=token,
        user={"id": user.id, "email": user.email, "display_name": user.display_name, "xp": user.xp, "level": user.level,
              "achievements": user.achievements or []},
    )


@router.post("/auth/google", response_model=AuthResponse)
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.google_id == req.google_id).first()
    if not user:
        user = db.query(User).filter(User.email == req.email).first()
        if user:
            user.google_id = req.google_id
        else:
            user = User(
                google_id=req.google_id,
                email=req.email,
                display_name=req.display_name or req.email.split("@")[0],
                avatar_url=req.avatar_url,
            )
            db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token({"sub": user.id})
    return AuthResponse(
        token=token,
        user={"id": user.id, "email": user.email, "display_name": user.display_name, "xp": user.xp, "level": user.level,
              "achievements": user.achievements or []},
    )


@router.get("/auth/me")
def get_me(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"id": user.id, "email": user.email, "display_name": user.display_name, "xp": user.xp, "level": user.level,
            "achievements": user.achievements or []}
