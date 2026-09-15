from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.attendance import ClassSession, Attendance
from app.schemas.attendance import ClassSessionCreate, AttendanceBulkRequest, AttendanceReasonRequest, AttendanceDecisionRequest
from app.utils.deps import get_current_user, require_permission
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/class-sessions")
async def create_class_session(data: ClassSessionCreate, db: AsyncSession = Depends(get_db)):
    pass


@router.get("/class-sessions")
async def list_class_sessions(group_id: Optional[int] = None, from_date: Optional[str] = None, to_date: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/class-sessions/{session_id}/attendance")
async def mark_attendance(session_id: int, data: AttendanceBulkRequest, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/attendance/{attendance_id}/reason")
async def add_reason(attendance_id: int, data: AttendanceReasonRequest, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/attendance-reasons/{reason_id}/decision")
async def decide(reason_id: int, data: AttendanceDecisionRequest, db: AsyncSession = Depends(get_db)):
    pass


@router.get("/enrollments/{enrollment_id}/attendance")
async def get_enrollment_attendance(enrollment_id: int, db: AsyncSession = Depends(get_db)):
    pass

