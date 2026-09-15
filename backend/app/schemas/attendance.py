from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, time, date


class ClassSessionCreate(BaseModel):
    group_id: int
    teacher_id: int
    lesson_id: Optional[int] = None
    date: date
    start_time: time
    end_time: time
    type: str
    format: str
    location_or_link: Optional[str] = None


class ClassSessionOut(BaseModel):
    id: int
    group_id: int
    teacher_id: int
    lesson_id: Optional[int]
    date: date
    start_time: time
    end_time: time
    type: str
    format: str
    location_or_link: Optional[str]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AttendanceBulkRequest(BaseModel):
    enrollment_ids: List[int]
    status: str


class AttendanceReasonRequest(BaseModel):
    reason_text: str


class AttendanceDecisionRequest(BaseModel):
    decision_type: str
    class_session_id: Optional[int] = None
    adjustment_amount: Optional[float] = None


class AttendanceOut(BaseModel):
    id: int
    class_session_id: int
    enrollment_id: int
    status: str
    marked_by: int
    marked_at: Optional[datetime] = None

    class Config:
        from_attributes = True

