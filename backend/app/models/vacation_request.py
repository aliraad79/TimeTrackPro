import enum

from app.core.database import Base
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class VacationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class VacationType(str, enum.Enum):
    SICK_LEAVE = "sick_leave"
    PERSONAL_DAY = "personal_day"
    OTHER = "other"


class VacationRequest(Base):
    __tablename__ = "vacation_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Request details
    data = Column(DateTime(timezone=True), nullable=False)
    vacation_type = Column(Enum(VacationType), default=VacationType.PERSONAL_DAY)
    status = Column(Enum(VacationStatus), default=VacationStatus.PENDING)

    # Request information
    reason = Column(Text, nullable=False)

    # Approval details
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship(
        "User", back_populates="vacation_requests", foreign_keys=[user_id]
    )
    approver = relationship("User", foreign_keys=[approved_by])

    def __repr__(self):
        return f"<VacationRequest(id={self.id}, user_id={self.user_id}, status='{self.status}')>"
