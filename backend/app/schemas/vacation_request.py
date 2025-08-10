from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.vacation_request import VacationStatus, VacationType

class VacationRequestBase(BaseModel):
    start_date: datetime
    end_date: datetime
    vacation_type: VacationType = VacationType.VACATION
    reason: str
    notes: Optional[str] = None

class VacationRequestCreate(VacationRequestBase):
    pass

class VacationRequestUpdate(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
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
    duration_days: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
