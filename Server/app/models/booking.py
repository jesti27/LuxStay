from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Union
from datetime import datetime
from bson import ObjectId
from enum import Enum

class BookingStatus(str, Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    CHECKED_IN = "Checked In"
    CHECKED_OUT = "Checked Out"
    CANCELLED = "Cancelled"

class BookingCreate(BaseModel):
    room_id: str
    guest_name: str
    guest_email: EmailStr
    guest_phone: str
    guest_address: str
    check_in_date: str
    check_out_date: str
    total_guests: int = Field(gt=0, le=10)
    special_requests: Optional[str] = None
    payment_method: str

class BookingUpdate(BaseModel):
    status: Optional[Union[BookingStatus, str]] = None
    special_requests: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    room_id: str
    room_number: str
    guest_name: str
    guest_email: str
    guest_phone: str
    guest_address: str
    check_in_date: str
    check_out_date: str
    total_guests: int
    total_amount: float
    status: BookingStatus
    special_requests: Optional[str]
    payment_method: str
    created_at: str

    class Config:
        use_enum_values = True