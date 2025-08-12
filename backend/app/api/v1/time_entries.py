from datetime import datetime
from typing import List

from app.core.auth import get_current_active_user, require_manager
from app.core.database import get_db
from app.models.time_entry import TimeEntry
from app.models.user import User
from app.schemas.time_entry import (ClockInRequest, ClockOutRequest,
                                    TimeEntryResponse, TimeEntryUpdate)
from app.services.location_service import LocationService
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/clock-in", response_model=TimeEntryResponse)
async def clock_in(
    request: ClockInRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Clock in at a specific location"""
    # Check if user is already clocked in
    active_entry = (
        db.query(TimeEntry)
        .filter(
            TimeEntry.user_id == current_user.id, TimeEntry.clock_out_time.is_(None)
        )
        .first()
    )

    if active_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You are already clocked in"
        )

    # Validate location access
    is_valid, error_message = LocationService.validate_location_access(
        db, request.location_id, request.latitude, request.longitude
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=error_message
        )

    # Create time entry
    time_entry = TimeEntry(
        user_id=current_user.id,
        location_id=request.location_id,
        clock_in_time=datetime.utcnow(),
        clock_in_latitude=request.latitude,
        clock_in_longitude=request.longitude,
        clock_in_accuracy=request.accuracy,
        notes=request.notes,
    )

    db.add(time_entry)
    db.commit()
    db.refresh(time_entry)

    return time_entry


@router.post("/clock-out", response_model=TimeEntryResponse)
async def clock_out(
    request: ClockOutRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Clock out from current shift"""
    # Find active time entry
    active_entry = (
        db.query(TimeEntry)
        .filter(
            TimeEntry.user_id == current_user.id, TimeEntry.clock_out_time.is_(None)
        )
        .first()
    )

    if not active_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not currently clocked in",
        )

    # Update time entry
    active_entry.clock_out_time = datetime.utcnow()
    active_entry.clock_out_latitude = request.latitude
    active_entry.clock_out_longitude = request.longitude
    active_entry.clock_out_accuracy = request.accuracy

    if request.notes:
        active_entry.notes = (
            active_entry.notes or ""
        ) + f"\nClock out notes: {request.notes}"

    db.commit()
    db.refresh(active_entry)

    return active_entry


@router.get("/my-entries", response_model=List[TimeEntryResponse])
async def get_my_entries(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get current user's time entries"""
    entries = (
        db.query(TimeEntry)
        .filter(TimeEntry.user_id == current_user.id)
        .order_by(TimeEntry.clock_in_time.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return entries


@router.get("/my-active", response_model=TimeEntryResponse)
async def get_my_active_entry(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Get current user's active time entry"""
    active_entry = (
        db.query(TimeEntry)
        .filter(
            TimeEntry.user_id == current_user.id, TimeEntry.clock_out_time.is_(None)
        )
        .first()
    )

    if not active_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No active time entry found"
        )

    return active_entry


@router.get("/active-employees", response_model=List[TimeEntryResponse])
async def get_active_employees(
    current_user: User = Depends(require_manager), db: Session = Depends(get_db)
):
    """Get all currently active employees (manager only)"""
    active_entries = (
        db.query(TimeEntry).filter(TimeEntry.clock_out_time.is_(None)).all()
    )

    return active_entries


@router.put("/{entry_id}", response_model=TimeEntryResponse)
async def update_time_entry(
    entry_id: int,
    update_data: TimeEntryUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    """Update time entry (manager only)"""
    time_entry = db.query(TimeEntry).filter(TimeEntry.id == entry_id).first()

    if not time_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Time entry not found"
        )

    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(time_entry, field, value)

    db.commit()
    db.refresh(time_entry)

    return time_entry
