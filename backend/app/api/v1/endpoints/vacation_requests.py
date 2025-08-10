from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_active_user, require_manager
from app.models.user import User
from app.models.vacation_request import VacationRequest, VacationStatus
from app.schemas.vacation_request import (
    VacationRequestCreate, 
    VacationRequestUpdate, 
    VacationRequestResponse
)

router = APIRouter()

@router.get("/my-requests", response_model=List[VacationRequestResponse])
async def get_my_vacation_requests(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's vacation requests"""
    requests = db.query(VacationRequest).filter(
        VacationRequest.user_id == current_user.id
    ).order_by(VacationRequest.created_at.desc()).offset(skip).limit(limit).all()
    
    return requests

@router.get("/pending", response_model=List[VacationRequestResponse])
async def get_pending_requests(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Get all pending vacation requests (manager only)"""
    requests = db.query(VacationRequest).filter(
        VacationRequest.status == VacationStatus.PENDING
    ).order_by(VacationRequest.created_at.desc()).offset(skip).limit(limit).all()
    
    return requests

@router.post("/", response_model=VacationRequestResponse)
async def create_vacation_request(
    request_data: VacationRequestCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create new vacation request"""
    # Validate dates
    if request_data.start_date >= request_data.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date"
        )
    
    if request_data.start_date < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date cannot be in the past"
        )
    
    # Create vacation request
    vacation_request = VacationRequest(
        user_id=current_user.id,
        **request_data.dict()
    )
    
    db.add(vacation_request)
    db.commit()
    db.refresh(vacation_request)
    
    return vacation_request

@router.get("/{request_id}", response_model=VacationRequestResponse)
async def get_vacation_request(
    request_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get vacation request by ID"""
    request = db.query(VacationRequest).filter(VacationRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacation request not found"
        )
    
    # Users can only see their own requests, managers can see all
    if request.user_id != current_user.id and current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return request

@router.put("/{request_id}/approve")
async def approve_vacation_request(
    request_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Approve vacation request (manager only)"""
    request = db.query(VacationRequest).filter(VacationRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacation request not found"
        )
    
    if request.status != VacationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request is not pending"
        )
    
    request.status = VacationStatus.APPROVED
    request.approved_by = current_user.id
    request.approved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(request)
    
    return {"message": "Vacation request approved"}

@router.put("/{request_id}/reject")
async def reject_vacation_request(
    request_id: int,
    rejection_reason: str,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Reject vacation request (manager only)"""
    request = db.query(VacationRequest).filter(VacationRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacation request not found"
        )
    
    if request.status != VacationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request is not pending"
        )
    
    request.status = VacationStatus.REJECTED
    request.rejection_reason = rejection_reason
    
    db.commit()
    db.refresh(request)
    
    return {"message": "Vacation request rejected"}

@router.put("/{request_id}", response_model=VacationRequestResponse)
async def update_vacation_request(
    request_id: int,
    request_data: VacationRequestUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update vacation request"""
    request = db.query(VacationRequest).filter(VacationRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacation request not found"
        )
    
    # Users can only update their own pending requests
    if request.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if request.status != VacationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update non-pending request"
        )
    
    # Update fields
    for field, value in request_data.dict(exclude_unset=True).items():
        setattr(request, field, value)
    
    db.commit()
    db.refresh(request)
    
    return request

@router.delete("/{request_id}")
async def cancel_vacation_request(
    request_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel vacation request"""
    request = db.query(VacationRequest).filter(VacationRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacation request not found"
        )
    
    # Users can only cancel their own pending requests
    if request.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if request.status != VacationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel non-pending request"
        )
    
    request.status = VacationStatus.CANCELLED
    db.commit()
    
    return {"message": "Vacation request cancelled"}
