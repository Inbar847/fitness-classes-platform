from decimal import Decimal
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.db_models import (
    Booking,
    BookingStatus,
    ClassSession,
    FitnessClass,
    Payment,
    Review,
    User,
    UserRole,
    Waitlist,
)

def book_session_for_user(db: Session, current_user: User, session_id: int):
    if current_user.role != UserRole.TRAINEE:
        raise HTTPException(status_code=403, detail="Only trainees can book sessions")

    class_session = (
        db.query(ClassSession)
        .filter(ClassSession.session_id == session_id)
        .first()
    )
    if not class_session:
        raise HTTPException(status_code=404, detail="Session not found")

    if class_session.end_time <= datetime.now(timezone.utc):
        raise HTTPException(
        status_code=400,
        detail="Cannot book a session that has already ended",
    )
    
    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.user_id == current_user.user_id,
            Booking.session_id == session_id,
        )
        .first()
    )
    if existing_booking:
        raise HTTPException(status_code=409, detail="User already booked this session")

    existing_waitlist_entry = (
        db.query(Waitlist)
        .filter(
            Waitlist.user_id == current_user.user_id,
            Waitlist.session_id == session_id,
        )
        .first()
    )
    if existing_waitlist_entry:
        raise HTTPException(status_code=409, detail="User is already on the waitlist for this session")

    confirmed_count = (
        db.query(Booking)
        .filter(
            Booking.session_id == session_id,
            Booking.status == BookingStatus.CONFIRMED,
        )
        .count()
    )

    try:
        if confirmed_count >= class_session.capacity:
            waitlist_entry = Waitlist(
                user_id=current_user.user_id,
                session_id=session_id,
            )
            db.add(waitlist_entry)
            db.commit()
            db.refresh(waitlist_entry)

            return {
                "outcome": "waitlisted",
                "message": "Session is full. User added to waitlist.",
                "booking": None,
                "payment": None,
                "waitlist_entry": waitlist_entry,
            }

        total_price = class_session.price or Decimal("0.00")

        booking = Booking(
            user_id=current_user.user_id,
            session_id=session_id,
            status=BookingStatus.CONFIRMED,
            total_price=total_price,
        )
        db.add(booking)
        db.flush()

        payment = None
        if total_price > Decimal("0.00"):
            payment = Payment(
                booking_id=booking.booking_id,
                amount=total_price,
            )
            db.add(payment)

        db.commit()
        db.refresh(booking)
        if payment is not None:
            db.refresh(payment)

        return {
            "outcome": "booked",
            "message": "Session booked successfully",
            "booking": booking,
            "payment": payment,
            "waitlist_entry": None,
        }

    except Exception:
        db.rollback()
        raise


def get_my_bookings(db: Session, current_user: User):
    return (
        db.query(Booking)
        .filter(Booking.user_id == current_user.user_id)
        .order_by(Booking.booking_id.desc())
        .all()
    )
    
    
    
def get_my_bookings_detailed(db: Session, current_user: User):
    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.session).joinedload(ClassSession.fitness_class)
        )
        .filter(Booking.user_id == current_user.user_id)
        .order_by(Booking.booking_id.desc())
        .all()
    )

    return [
        {
            "booking_id": booking.booking_id,
            "session_id": booking.session.session_id,
            "class_id": booking.session.fitness_class.class_id,
            "class_title": booking.session.fitness_class.title,
            "start_time": booking.session.start_time,
            "end_time": booking.session.end_time,
            "status": booking.status,
            "total_price": booking.total_price,
        }
        for booking in bookings
    ]


def promote_first_waitlist_user(db: Session, current_user: User, session_id: int):
    if current_user.role not in [UserRole.TRAINER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only trainers or admins can promote waitlist users",
        )

    class_session = (
        db.query(ClassSession)
        .filter(ClassSession.session_id == session_id)
        .first()
    )
    if not class_session:
        raise HTTPException(status_code=404, detail="Session not found")

    confirmed_count = (
        db.query(Booking)
        .filter(
            Booking.session_id == session_id,
            Booking.status == BookingStatus.CONFIRMED,
        )
        .count()
    )

    if confirmed_count >= class_session.capacity:
        raise HTTPException(
            status_code=409,
            detail="Session is still full. No available spot to promote.",
        )

    first_waitlist_entry = (
        db.query(Waitlist)
        .filter(Waitlist.session_id == session_id)
        .order_by(Waitlist.created_at.asc(), Waitlist.waitlist_id.asc())
        .first()
    )

    if not first_waitlist_entry:
        raise HTTPException(status_code=404, detail="No users on the waitlist for this session")

    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.user_id == first_waitlist_entry.user_id,
            Booking.session_id == session_id,
        )
        .first()
    )
    if existing_booking:
        db.delete(first_waitlist_entry)
        db.commit()
        raise HTTPException(
            status_code=409,
            detail="Waitlist entry removed because the user already has a booking",
        )

    total_price = class_session.price or Decimal("0.00")

    try:
        promoted_booking = Booking(
            user_id=first_waitlist_entry.user_id,
            session_id=session_id,
            status=BookingStatus.CONFIRMED,
            total_price=total_price,
        )
        db.add(promoted_booking)
        db.flush()

        payment = None
        if total_price > Decimal("0.00"):
            payment = Payment(
                booking_id=promoted_booking.booking_id,
                amount=total_price,
            )
            db.add(payment)

        db.delete(first_waitlist_entry)
        db.commit()
        db.refresh(promoted_booking)
        if payment is not None:
            db.refresh(payment)

        return {
            "outcome": "booked",
            "message": "First waitlist user promoted successfully",
            "booking": promoted_booking,
            "payment": payment,
            "waitlist_entry": None,
        }

    except Exception:
        db.rollback()
        raise    
    
    
def can_leave_review(db: Session, current_user: User, class_id: int) -> bool:
    existing_review = (
        db.query(Review)
        .filter(
            Review.user_id == current_user.user_id,
            Review.class_id == class_id,
        )
        .first()
    )

    if existing_review:
        return False

    past_booking = (
        db.query(Booking)
        .join(ClassSession, Booking.session_id == ClassSession.session_id)
        .filter(
            Booking.user_id == current_user.user_id,
            Booking.status == BookingStatus.CONFIRMED,
            ClassSession.class_id == class_id,
            ClassSession.end_time < datetime.now(timezone.utc),
        )
        .first()
    )

    return past_booking is not None


def _normalize_role_value(role) -> str:
    return getattr(role, "value", str(role)).lower()


def _ensure_trainer_owns_session(db: Session, current_user: User, session_id: int) -> ClassSession:
    role_value = _normalize_role_value(current_user.role)

    if role_value not in {"trainer", "admin"}:
        raise HTTPException(
            status_code=403,
            detail="Only trainers or admins can view session management data",
        )

    class_session = (
        db.query(ClassSession)
        .filter(ClassSession.session_id == session_id)
        .first()
    )
    if not class_session:
        raise HTTPException(status_code=404, detail="Session not found")

    fitness_class = (
        db.query(FitnessClass)
        .filter(FitnessClass.class_id == class_session.class_id)
        .first()
    )
    if not fitness_class:
        raise HTTPException(status_code=404, detail="Class not found")

    if role_value == "trainer" and fitness_class.trainer_id != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only view data for your own sessions",
        )

    return class_session


def get_session_participants_for_trainer(db: Session, current_user: User, session_id: int):
    _ensure_trainer_owns_session(db, current_user, session_id)

    rows = (
        db.query(Booking, User)
        .join(User, Booking.user_id == User.user_id)
        .filter(
            Booking.session_id == session_id,
            Booking.status == BookingStatus.CONFIRMED,
        )
        .order_by(User.full_name.asc(), Booking.booking_id.asc())
        .all()
    )

    participants = []
    for booking, user in rows:
        participants.append(
            {
                "user_id": user.user_id,
                "full_name": user.full_name,
                "email": user.email,
                "status": getattr(booking.status, "value", str(booking.status)).lower(),
            }
        )

    return participants


def get_session_waitlist_for_trainer(db: Session, current_user: User, session_id: int):
    _ensure_trainer_owns_session(db, current_user, session_id)

    rows = (
        db.query(Waitlist, User)
        .join(User, Waitlist.user_id == User.user_id)
        .filter(Waitlist.session_id == session_id)
        .order_by(Waitlist.created_at.asc(), Waitlist.waitlist_id.asc())
        .all()
    )

    waitlist_entries = []
    for waitlist_entry, user in rows:
        waitlist_entries.append(
            {
                "user_id": user.user_id,
                "full_name": user.full_name,
                "email": user.email,
                "created_at": waitlist_entry.created_at.isoformat(),
            }
        )

    return waitlist_entries    

def _ensure_admin(current_user: User) -> None:
    if _normalize_role_value(current_user.role) != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )


def get_admin_analytics(db: Session, current_user: User):
    _ensure_admin(current_user)

    total_users = db.query(User).count()
    total_bookings = db.query(Booking).count()
    confirmed_bookings = (
        db.query(Booking)
        .filter(Booking.status == BookingStatus.CONFIRMED)
        .count()
    )
    total_revenue = (
        db.query(func.coalesce(func.sum(Booking.total_price), Decimal("0.00")))
        .filter(Booking.status == BookingStatus.CONFIRMED)
        .scalar()
    )
    total_classes = db.query(FitnessClass).count()

    return {
        "total_users": total_users,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "total_revenue": total_revenue,
        "total_classes": total_classes,
    }


def get_recent_activity(db: Session, current_user: User, limit: int = 10):
    _ensure_admin(current_user)

    payment_rows = (
        db.query(Payment, Booking)
        .join(Booking, Payment.booking_id == Booking.booking_id)
        .order_by(Payment.payment_date.desc())
        .limit(limit)
        .all()
    )

    waitlist_rows = (
        db.query(Waitlist)
        .order_by(Waitlist.created_at.desc())
        .limit(limit)
        .all()
    )

    activity = []

    for payment, booking in payment_rows:
        activity.append(
            {
                "type": "booking",
                "user_id": booking.user_id,
                "session_id": booking.session_id,
                "status": getattr(booking.status, "value", str(booking.status)).lower(),
                "created_at": payment.payment_date,
            }
        )

    for waitlist_entry in waitlist_rows:
        activity.append(
            {
                "type": "waitlist",
                "user_id": waitlist_entry.user_id,
                "session_id": waitlist_entry.session_id,
                "created_at": waitlist_entry.created_at,
            }
        )

    activity.sort(key=lambda item: item["created_at"], reverse=True)
    return activity[:limit]


def create_review(db: Session, current_user: User, class_id: int, rating: int, comment: str | None):
    if current_user.role != UserRole.TRAINEE:
        raise HTTPException(status_code=403, detail="Only trainees can leave reviews")

    if not can_leave_review(db, current_user, class_id):
        raise HTTPException(
            status_code=403,
            detail="Review is allowed only after attending a completed class and only once",
        )

    fitness_class = (
        db.query(FitnessClass)
        .filter(FitnessClass.class_id == class_id)
        .first()
    )
    if not fitness_class:
        raise HTTPException(status_code=404, detail="Class not found")

    review = Review(
        user_id=current_user.user_id,
        class_id=class_id,
        rating=rating,
        comment=comment.strip() if comment else None,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return {
        "review_id": review.review_id,
        "user_id": current_user.user_id,
        "user_name": current_user.full_name,
        "class_id": review.class_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at,
    }


def get_class_reviews(db: Session, class_id: int):
    reviews = (
        db.query(Review, User)
        .join(User, Review.user_id == User.user_id)
        .filter(Review.class_id == class_id)
        .order_by(Review.created_at.desc(), Review.review_id.desc())
        .all()
    )

    return [
        {
            "review_id": review.review_id,
            "user_id": review.user_id,
            "user_name": user.full_name,
            "class_id": review.class_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
        }
        for review, user in reviews
    ]