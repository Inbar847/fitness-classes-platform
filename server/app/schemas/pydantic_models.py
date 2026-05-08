from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.db_models import UserRole, BookingStatus


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None


class UserRegister(UserBase):
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.TRAINEE


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    role: UserRole
    
class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category_id: int
    name: str
    description: Optional[str] = None
    created_at: datetime


class FitnessClassCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    trainer_id: int
    category_id: int
    cover_image_url: Optional[str] = None



class FitnessClassResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    class_id: int
    title: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    trainer_id: int
    category_id: int
    
    
class FitnessClassViewResponse(BaseModel):
    class_id: int
    title: str
    description: Optional[str] = None
    trainer_id: int
    trainer_name: str
    category_id: int
    category_name: str
    cover_image_url: Optional[str] = None 
    
    
class TrainerStatsResponse(BaseModel):
    total_classes: int
    total_sessions: int
    total_revenue: Decimal     


class ClassSessionCreate(BaseModel):
    class_id: int
    start_time: datetime
    end_time: datetime
    price: Decimal = Field(default=Decimal("0.00"), ge=0)
    image_url: Optional[str] = None
    capacity: int = Field(..., gt=0)


class ClassSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: int
    class_id: int
    start_time: datetime
    end_time: datetime
    price: Decimal
    image_url: Optional[str] = None
    capacity: int    
    
    
    
class BookingCreate(BaseModel):
    session_id: int


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    booking_id: int
    user_id: int
    session_id: int
    status: BookingStatus
    total_price: Decimal


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    payment_id: int
    booking_id: int
    amount: Decimal
    payment_date: datetime


class WaitlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    waitlist_id: int
    user_id: int
    session_id: int
    created_at: datetime


class BookingActionResponse(BaseModel):
    outcome: str
    message: str
    booking: Optional[BookingResponse] = None
    payment: Optional[PaymentResponse] = None
    waitlist_entry: Optional[WaitlistResponse] = None 
    
    
class BookingHistoryItemResponse(BaseModel):
    booking_id: int
    session_id: int
    class_id: int
    class_title: str
    start_time: datetime
    end_time: datetime
    status: BookingStatus
    total_price: Decimal      
    
    
class UserProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserProfileUpdateResponse(BaseModel):
    user_id: int
    full_name: str
    phone_number: Optional[str] = None


class ReviewEligibilityResponse(BaseModel):
    can_review: bool    
    
    
class AdminUserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    role: UserRole


class AdminUserRoleUpdateRequest(BaseModel):
    new_role: UserRole


class AdminOverviewResponse(BaseModel):
    total_users: int
    total_trainers: int
    total_classes: int   
    
    
class AdminAnalyticsResponse(BaseModel):
    total_users: int
    total_bookings: int
    confirmed_bookings: int
    total_revenue: Decimal
    total_classes: int


class AdminActivityItemResponse(BaseModel):
    type: str
    user_id: int
    session_id: int
    status: Optional[str] = None
    created_at: datetime    
    
    
class ReviewCreate(BaseModel):
    class_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=500)


class ReviewResponse(BaseModel):
    review_id: int
    user_id: int
    user_name: str
    class_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime