from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from app.models.vacation_request import VacationStatus, VacationType

class VacationRequestBase(BaseModel):
    date: date
    vacation_type: VacationType = VacationType.PERSONAL_DAY
    reason: str
    notes: Optional[str] = None

class VacationRequestCreate(VacationRequestBase):
    pass

class VacationRequestUpdate(BaseModel):
    date: Optional[datetime] = None
    vacation_type: Optional[VacationType] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[VacationStatus] = None
    rejection_reason: Optional[str] = None

class VacationRequestResponse(VacationRequestBase):
    id: int
    user_id: int
    status: VacationStatus
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
