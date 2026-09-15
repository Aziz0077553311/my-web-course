from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.attendance import AttendanceReason, Attendance


async def check_attendance_deadlines(db: AsyncSession):
    now = datetime.now(timezone.utc)
    reminder_cutoff = now - timedelta(days=1)

    result = await db.execute(
        select(AttendanceReason).where(
            AttendanceReason.decision_type.is_(None),
            AttendanceReason.deadline_at <= reminder_cutoff,
        )
    )
    reasons = result.scalars().all()

    overdue_cutoff = now
    result = await db.execute(
        select(Attendance).join(AttendanceReason).where(
            AttendanceReason.decision_type.is_(None),
            AttendanceReason.deadline_at < overdue_cutoff,
        )
    )
    attendances = result.scalars().all()
    for att in attendances:
        att.status = "absent_unresolved"


async def mark_overdue_submissions(db: AsyncSession):
    pass

