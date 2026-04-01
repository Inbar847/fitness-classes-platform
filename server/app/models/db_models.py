from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from enum import Enum as PyEnum
from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.database.database import Base


class UserRole(str, PyEnum):
    TRAINEE = "trainee"
    TRAINER = "trainer"
    ADMIN = "admin"

class BookingStatus(str, PyEnum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.TRAINEE)
    phone_number = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    bookings = relationship("Booking", back_populates="user")
    waitlist_entries = relationship("Waitlist", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    
class Category(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    classes = relationship("FitnessClass", back_populates="category")


class FitnessClass(Base):
    __tablename__ = "classes"

    class_id = Column(Integer, primary_key=True, index=True)
    trainer_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    cover_image_url = Column(String(255), nullable=True)

    trainer = relationship("User")
    category = relationship("Category", back_populates="classes")
    sessions = relationship(
        "ClassSession",
        back_populates="fitness_class",
        cascade="all, delete-orphan",
    )
    
    reviews = relationship(
    "Review",
    back_populates="fitness_class",
    cascade="all, delete-orphan",
    )


class ClassSession(Base):
    __tablename__ = "class_sessions"

    session_id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    image_url = Column(String(255), nullable=True)
    capacity = Column(Integer, nullable=False)
    fitness_class = relationship("FitnessClass", back_populates="sessions")    
    bookings = relationship("Booking", back_populates="session")
    waitlist_entries = relationship("Waitlist", back_populates="session")
    
    
class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        UniqueConstraint("user_id", "session_id", name="uq_booking_user_session"),
    )

    booking_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    session_id = Column(Integer, ForeignKey("class_sessions.session_id"), nullable=False)
    status = Column(SQLEnum(BookingStatus), nullable=False, default=BookingStatus.CONFIRMED)
    total_price = Column(Numeric(10, 2), nullable=False, default=0)

    user = relationship("User", back_populates="bookings")
    session = relationship("ClassSession", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"), nullable=False, unique=True)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    booking = relationship("Booking", back_populates="payment")


class Waitlist(Base):
    __tablename__ = "waitlist"
    __table_args__ = (
        UniqueConstraint("user_id", "session_id", name="uq_waitlist_user_session"),
    )

    waitlist_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    session_id = Column(Integer, ForeignKey("class_sessions.session_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="waitlist_entries")
    session = relationship("ClassSession", back_populates="waitlist_entries")
    
class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("user_id", "class_id", name="uq_review_user_class"),
    )

    review_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="reviews")
    fitness_class = relationship("FitnessClass", back_populates="reviews")