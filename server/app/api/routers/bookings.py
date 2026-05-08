from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routers.auth import get_current_user, get_db
from app.models.db_models import User
from app.schemas.pydantic_models import (
    AdminActivityItemResponse,
    AdminAnalyticsResponse,
    BookingActionResponse,
    BookingCreate,
    BookingHistoryItemResponse,
    BookingResponse,
    ReviewCreate,
    ReviewEligibilityResponse,
    ReviewResponse,
)
from app.services.bookings_service import (
    book_session_for_user,
    can_leave_review,
    create_review,
    get_admin_analytics,
    get_class_reviews,
    get_my_bookings,
    get_my_bookings_detailed,
    get_recent_activity,
    promote_first_waitlist_user,
)

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingActionResponse, status_code=201)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return book_session_for_user(
        db=db,
        current_user=current_user,
        session_id=payload.session_id,
    )


@router.get("/my", response_model=list[BookingResponse])
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_bookings(db=db, current_user=current_user)


@router.get("/my/detailed", response_model=list[BookingHistoryItemResponse])
def list_my_bookings_detailed(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_bookings_detailed(db=db, current_user=current_user)


@router.post("/promote/{session_id}", response_model=BookingActionResponse)
def promote_waitlist_user(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return promote_first_waitlist_user(
        db=db,
        current_user=current_user,
        session_id=session_id,
    )
    
@router.get("/can-review/{class_id}", response_model=ReviewEligibilityResponse)
def can_review_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"can_review": can_leave_review(db=db, current_user=current_user, class_id=class_id)}    


@router.get("/admin/analytics", response_model=AdminAnalyticsResponse)
def api_admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_admin_analytics(db=db, current_user=current_user)


@router.get("/admin/activity", response_model=list[AdminActivityItemResponse])
def api_admin_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_recent_activity(
        db=db,
        current_user=current_user,
        limit=limit,
    )
    
    
@router.post("/reviews", response_model=ReviewResponse, status_code=201)
def api_create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_review(
        db=db,
        current_user=current_user,
        class_id=payload.class_id,
        rating=payload.rating,
        comment=payload.comment,
    )


@router.get("/reviews/{class_id}", response_model=list[ReviewResponse])
def api_get_class_reviews(
    class_id: int,
    db: Session = Depends(get_db),
):
    return get_class_reviews(db=db, class_id=class_id)