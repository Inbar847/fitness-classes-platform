from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.db_models import User, UserRole, FitnessClass
from app.schemas.pydantic_models import UserRegister
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_user(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_user(db: Session, user_data: UserRegister) -> User:
    if user_data.role != UserRole.TRAINEE:
        raise HTTPException(status_code=403, detail="Only trainee registration allowed in MVP")

    hashed_password = get_password_hash(user_data.password)

    db_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hashed_password,
        phone_number=user_data.phone_number,
        role=UserRole.TRAINEE,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_current_user_by_token(db: Session, token: str) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not isinstance(email, str) or not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user(db, email)
    if user is None:
        raise credentials_exception

    return user


def update_user_profile(
    db: Session,
    current_user: User,
    full_name: str | None = None,
    phone_number: str | None = None,
) -> User:
    if full_name is not None:
        cleaned_name = full_name.strip()
        if not cleaned_name:
            raise HTTPException(status_code=400, detail="Full name cannot be empty")
        current_user.full_name = cleaned_name

    if phone_number is not None:
        cleaned_phone = phone_number.strip()
        current_user.phone_number = cleaned_phone or None

    db.commit()
    db.refresh(current_user)
    return current_user


def _normalize_role_value(role: UserRole | str) -> str:
    return getattr(role, "value", str(role)).lower()


def ensure_admin(current_user: User) -> None:
    if _normalize_role_value(current_user.role) != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


def get_all_users(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 50,
) -> list[User]:
    ensure_admin(current_user)

    return (
        db.query(User)
        .order_by(User.user_id.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def change_user_role(
    db: Session,
    current_user: User,
    user_id: int,
    new_role: UserRole,
) -> User:
    ensure_admin(current_user)

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.user_id == current_user.user_id and new_role != UserRole.ADMIN:
        raise HTTPException(
            status_code=400,
            detail="You cannot remove your own admin role",
        )

    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


def get_admin_overview(db: Session, current_user: User) -> dict:
    ensure_admin(current_user)

    total_users = db.query(User).count()
    total_trainers = db.query(User).filter(User.role == UserRole.TRAINER).count()
    total_classes = db.query(FitnessClass).count()

    return {
        "total_users": total_users,
        "total_trainers": total_trainers,
        "total_classes": total_classes,
    }