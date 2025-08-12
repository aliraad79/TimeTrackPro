from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


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


class TimeEntryResponse(TimeEntryBase):
    id: int
    user_id: int
    time: datetime
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    duration_minutes: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
