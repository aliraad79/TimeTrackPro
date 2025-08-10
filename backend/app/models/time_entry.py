from sqlalchemy import Column, Integer, DateTime, Float, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class TimeEntry(Base):
    __tablename__ = "time_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    
    # Clock in details
    clock_in_time = Column(DateTime(timezone=True), nullable=False)
    clock_in_latitude = Column(Float, nullable=False)
    clock_in_longitude = Column(Float, nullable=False)
    clock_in_accuracy = Column(Float, nullable=True)
    
    # Clock out details
    clock_out_time = Column(DateTime(timezone=True), nullable=True)
    clock_out_latitude = Column(Float, nullable=True)
    clock_out_longitude = Column(Float, nullable=True)
    clock_out_accuracy = Column(Float, nullable=True)
    
    # Additional info
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="time_entries")
    location = relationship("Location", back_populates="time_entries")
    
    @property
    def duration_minutes(self):
        """Calculate duration in minutes if clocked out"""
        if self.clock_out_time and self.clock_in_time:
            return int((self.clock_out_time - self.clock_in_time).total_seconds() / 60)
        return None
    
    @property
    def is_active(self):
        """Check if the time entry is currently active (clocked in but not out)"""
        return self.clock_in_time is not None and self.clock_out_time is None
    
    def __repr__(self):
        return f"<TimeEntry(id={self.id}, user_id={self.user_id}, clock_in='{self.clock_in_time}')>"
