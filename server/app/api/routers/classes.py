from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.routers.auth import get_current_user
from app.database.database import SessionLocal
from app.models.db_models import User
from app.services.bookings_service import (
    get_session_participants_for_trainer,
    get_session_waitlist_for_trainer,
)
from app.schemas.pydantic_models import (
    CategoryCreate,
    CategoryResponse,
    ClassSessionCreate,
    ClassSessionResponse,
    FitnessClassCreate,
    FitnessClassViewResponse,
    TrainerStatsResponse,
)
from app.services.classes_service import (
    build_fitness_class_view,
    create_category,
    create_class_session,
    create_fitness_class,
    get_categories,
    get_class_by_id,
    get_classes,
    get_sessions_by_class,
    get_trainer_classes,
    get_trainer_stats,
)

router = APIRouter(prefix="/classes", tags=["classes"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/categories", response_model=CategoryResponse, status_code=201)
def api_create_category(category_data: CategoryCreate, db: Session = Depends(get_db)):
    return create_category(db, category_data)


@router.get("/categories", response_model=list[CategoryResponse])
def api_get_categories(db: Session = Depends(get_db)):
    return get_categories(db)


@router.post("", response_model=FitnessClassViewResponse, status_code=201)
def api_create_class(
    class_data: FitnessClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    created = create_fitness_class(db, class_data, current_user)
    return build_fitness_class_view(db, created)


@router.get("", response_model=list[FitnessClassViewResponse])
def api_get_classes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    category_id: int | None = Query(None),
    trainer_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    return get_classes(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        category_id=category_id,
        trainer_id=trainer_id,
    )


@router.get("/trainer/my", response_model=list[FitnessClassViewResponse])
def api_get_my_trainer_classes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_trainer_classes(
        db=db,
        current_user=current_user,
        skip=skip,
        limit=limit,
    )


@router.get("/trainer/stats", response_model=TrainerStatsResponse)
def api_get_my_trainer_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_trainer_stats(db, current_user)


@router.post("/sessions", response_model=ClassSessionResponse, status_code=201)
def api_create_session(
    session_data: ClassSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_class_session(db, session_data, current_user)

@router.get("/trainer/sessions/{session_id}/participants")
def api_get_trainer_session_participants(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_session_participants_for_trainer(db, current_user, session_id)


@router.get("/trainer/sessions/{session_id}/waitlist")
def api_get_trainer_session_waitlist(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_session_waitlist_for_trainer(db, current_user, session_id)


@router.get("/{class_id}/sessions", response_model=list[ClassSessionResponse])
def api_get_sessions(
    class_id: int,
    include_past: bool = Query(False),
    db: Session = Depends(get_db),
):
    return get_sessions_by_class(
        db=db,
        class_id=class_id,
        include_past=include_past,
    )


@router.get("/{class_id}", response_model=FitnessClassViewResponse)
def api_get_class(class_id: int, db: Session = Depends(get_db)):
    return get_class_by_id(db, class_id)