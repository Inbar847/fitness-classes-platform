from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.db_models import User
from app.schemas.pydantic_models import (
    AdminOverviewResponse,
    AdminUserResponse,
    AdminUserRoleUpdateRequest,
    UserProfileUpdateRequest,
    UserProfileUpdateResponse,
    UserRegister,
    Token,
    UserResponse,
)
from app.services.auth_service import (
    authenticate_user,
    change_user_role,
    create_access_token,
    create_user,
    get_admin_overview,
    get_all_users,
    get_current_user_by_token,
    update_user_profile,
)

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    return get_current_user_by_token(db, token)


@router.post("/register", response_model=UserResponse)
def register(user: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    return create_user(db, user)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=UserProfileUpdateResponse)
def update_profile(
    payload: UserProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_user = update_user_profile(
        db=db,
        current_user=current_user,
        full_name=payload.full_name,
        phone_number=payload.phone_number,
    )

    return {
        "user_id": updated_user.user_id,
        "full_name": updated_user.full_name,
        "phone_number": updated_user.phone_number,
    }
    
    
@router.get("/admin/users", response_model=list[AdminUserResponse])
def api_admin_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_users(
        db=db,
        current_user=current_user,
        skip=skip,
        limit=limit,
    )


@router.patch("/admin/users/{user_id}/role", response_model=AdminUserResponse)
def api_change_role(
    user_id: int,
    payload: AdminUserRoleUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return change_user_role(
        db=db,
        current_user=current_user,
        user_id=user_id,
        new_role=payload.new_role,
    )


@router.get("/admin/overview", response_model=AdminOverviewResponse)
def api_admin_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_admin_overview(db=db, current_user=current_user)    