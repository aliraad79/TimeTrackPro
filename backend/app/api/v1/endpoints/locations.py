from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_active_user, require_manager
from app.models.location import Location
from app.schemas.location import LocationCreate, LocationUpdate, LocationResponse

router = APIRouter()

@router.get("/", response_model=List[LocationResponse])
async def get_locations(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all active locations"""
    locations = db.query(Location).filter(
        Location.is_active == True
    ).offset(skip).limit(limit).all()
    return locations

@router.get("/all", response_model=List[LocationResponse])
async def get_all_locations(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Get all locations (including inactive) - manager only"""
    locations = db.query(Location).offset(skip).limit(limit).all()
    return locations

@router.post("/", response_model=LocationResponse)
async def create_location(
    location_data: LocationCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create new location (manager only)"""
    location = Location(**location_data.dict())
    db.add(location)
    db.commit()
    db.refresh(location)
    return location

@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get location by ID"""
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    return location

@router.put("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: int,
    location_data: LocationUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update location (manager only)"""
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Update fields
    for field, value in location_data.dict(exclude_unset=True).items():
        setattr(location, field, value)
    
    db.commit()
    db.refresh(location)
    return location

@router.delete("/{location_id}")
async def delete_location(
    location_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete location (manager only)"""
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Check if location has active time entries
    active_entries = db.query(TimeEntry).filter(
        TimeEntry.location_id == location_id,
        TimeEntry.clock_out_time.is_(None)
    ).first()
    
    if active_entries:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete location with active time entries"
        )
    
    db.delete(location)
    db.commit()
    
    return {"message": "Location deleted successfully"}
