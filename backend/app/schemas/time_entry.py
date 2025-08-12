from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TimeEntryBase(BaseModel):
    location_id: int
    notes: Optional[str] = None


class TimeEntryCreate(TimeEntryBase):
    pass


class TimeEntryUpdate(BaseModel):
    notes: Optional[str] = None


class ClockInRequest(BaseModel):
    location_id: int
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy: Optional[float] = None
    notes: Optional[str] = None


class ClockOutRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy: Optional[float] = None
    notes: Optional[str] = None


class TimeEntryResponse(TimeEntryBase):
    id: int
    user_id: int
    clock_in_time: datetime
    clock_in_latitude: float
    clock_in_longitude: float
    clock_in_accuracy: Optional[float] = None

    clock_out_time: Optional[datetime]
    clock_out_latitude: Optional[float]
    clock_out_longitude: Optional[float]
    clock_out_accuracy: Optional[float] = None

    duration_minutes: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
