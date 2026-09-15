from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class EnrollmentCreate(BaseModel):
    student_id: int
    group_id: int
    course_id: int


class EnrollmentUpdate(BaseModel):
    status: Optional[str] = None


class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    group_id: int
    course_id: int
    status: str
    enrolled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LessonCompleteRequest(BaseModel):
    pass


class EarlyUnlockRequest(BaseModel):
    reason: str


class EnrollmentLessonStatusOut(BaseModel):
    id: int
    enrollment_id: int
    lesson_id: int
    status: str
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

