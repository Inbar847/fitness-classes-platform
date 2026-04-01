from decimal import Decimal
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.db_models import (
    Booking,
    BookingStatus,
    Category,
    ClassSession,
    FitnessClass,
    User,
)
from app.schemas.pydantic_models import (
    CategoryCreate,
    ClassSessionCreate,
    FitnessClassCreate,
)


def _normalize_role(user: User) -> str:
    role = getattr(user, "role", None)
    if role is None:
        return ""
    return getattr(role, "value", str(role)).lower()


def _ensure_trainer(user: User) -> None:
    if _normalize_role(user) != "trainer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only trainers can perform this action",
        )


def create_category(db: Session, category_data: CategoryCreate) -> Category:
    existing_category = (
        db.query(Category)
        .filter(Category.name == category_data.name)
        .first()
    )
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category already exists",
        )

    category = Category(**category_data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def get_categories(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.name.asc()).all()


def create_fitness_class(
    db: Session,
    class_data: FitnessClassCreate,
    current_user: User,
) -> FitnessClass:
    _ensure_trainer(current_user)

    if class_data.trainer_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="trainer_id must match the authenticated trainer",
        )

    category = (
        db.query(Category)
        .filter(Category.category_id == class_data.category_id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    payload = class_data.model_dump()
    payload["trainer_id"] = current_user.user_id

    fitness_class = FitnessClass(**payload)
    db.add(fitness_class)
    db.commit()
    db.refresh(fitness_class)
    return fitness_class


def build_fitness_class_view(db: Session, fitness_class: FitnessClass) -> dict:
    trainer = db.query(User).filter(User.user_id == fitness_class.trainer_id).first()
    category = (
        db.query(Category)
        .filter(Category.category_id == fitness_class.category_id)
        .first()
    )

    return {
        "class_id": fitness_class.class_id,
        "title": fitness_class.title,
        "description": fitness_class.description,
        "cover_image_url": fitness_class.cover_image_url,
        "trainer_id": fitness_class.trainer_id,
        "trainer_name": trainer.full_name if trainer else f"Trainer #{fitness_class.trainer_id}",
        "category_id": fitness_class.category_id,
        "category_name": category.name if category else f"Category #{fitness_class.category_id}",
    }


def get_classes(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
    category_id: int | None = None,
    trainer_id: int | None = None,
) -> list[dict]:
    query = db.query(FitnessClass)

    if search:
        query = query.filter(FitnessClass.title.ilike(f"%{search.strip()}%"))

    if category_id is not None:
        query = query.filter(FitnessClass.category_id == category_id)

    if trainer_id is not None:
        query = query.filter(FitnessClass.trainer_id == trainer_id)

    classes = (
        query.order_by(FitnessClass.class_id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [build_fitness_class_view(db, fitness_class) for fitness_class in classes]


def get_trainer_classes(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 20,
) -> list[dict]:
    _ensure_trainer(current_user)

    classes = (
        db.query(FitnessClass)
        .filter(FitnessClass.trainer_id == current_user.user_id)
        .order_by(FitnessClass.class_id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [build_fitness_class_view(db, fitness_class) for fitness_class in classes]


def create_class_session(
    db: Session,
    session_data: ClassSessionCreate,
    current_user: User,
) -> ClassSession:
    _ensure_trainer(current_user)

    fitness_class = (
        db.query(FitnessClass)
        .filter(FitnessClass.class_id == session_data.class_id)
        .first()
    )
    if not fitness_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    if fitness_class.trainer_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create sessions for your own classes",
        )

    if session_data.end_time <= session_data.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_time must be later than start_time",
        )

    session = ClassSession(**session_data.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_trainer_stats(db: Session, current_user: User) -> dict:
    _ensure_trainer(current_user)

    total_classes = (
        db.query(FitnessClass)
        .filter(FitnessClass.trainer_id == current_user.user_id)
        .count()
    )

    total_sessions = (
        db.query(ClassSession)
        .join(FitnessClass, ClassSession.class_id == FitnessClass.class_id)
        .filter(FitnessClass.trainer_id == current_user.user_id)
        .count()
    )

    total_revenue = (
        db.query(func.coalesce(func.sum(Booking.total_price), Decimal("0.00")))
        .join(ClassSession, Booking.session_id == ClassSession.session_id)
        .join(FitnessClass, ClassSession.class_id == FitnessClass.class_id)
        .filter(
            FitnessClass.trainer_id == current_user.user_id,
            Booking.status == BookingStatus.CONFIRMED,
        )
        .scalar()
    )

    return {
        "total_classes": total_classes,
        "total_sessions": total_sessions,
        "total_revenue": total_revenue,
    }


def get_sessions_by_class(
    db: Session,
    class_id: int,
    include_past: bool = False,
) -> list[ClassSession]:
    fitness_class = (
        db.query(FitnessClass)
        .filter(FitnessClass.class_id == class_id)
        .first()
    )
    if not fitness_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    query = db.query(ClassSession).filter(ClassSession.class_id == class_id)

    if not include_past:
        query = query.filter(ClassSession.end_time > datetime.now(timezone.utc))

    return query.order_by(ClassSession.start_time.asc()).all()


def get_class_by_id(db: Session, class_id: int) -> dict:
    fitness_class = (
        db.query(FitnessClass)
        .filter(FitnessClass.class_id == class_id)
        .first()
    )

    if not fitness_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )

    return build_fitness_class_view(db, fitness_class)