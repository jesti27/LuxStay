from pydantic import BaseModel, Field
from typing import List, Optional

class RoomCreate(BaseModel):
    roomNumber: str = Field(..., description="Unique room number")
    roomType: str = Field(..., description="Single, Double, Suite, Deluxe")
    pricePerNight: float = Field(..., description="Price per night")
    status: str = Field(default="Available", description="Available, Occupied, Maintenance")
    specialFeatures: List[str] = Field(default=[], description="Optional special features")
    images: List[str] = Field(default=[], description="Image URLs or paths")

class RoomUpdate(BaseModel):
    roomNumber: Optional[str] = None
    roomType: Optional[str] = None
    pricePerNight: Optional[float] = None
    status: Optional[str] = None
    specialFeatures: Optional[List[str]] = None
    images: Optional[List[str]] = None
