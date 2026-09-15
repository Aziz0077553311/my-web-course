from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sql_func
from typing import Optional

from app.models.enrollment import Enrollment
from app.models.assignment import Assignment, Submission
from app.models.grade import Grade
from app.models.enrollment_lesson_status import EnrollmentLessonStatus


async def recalculate_progress(enrollment_id: int, db: AsyncSession) -> float:
    total_lessons = 50

    result = await db.execute(
        select(sql_func.count(EnrollmentLessonStatus.id)).where(
            EnrollmentLessonStatus.enrollment_id == enrollment_id,
            EnrollmentLessonStatus.status == "completed",
        )
    )
    completed_lessons = result.scalar() or 0

    result = await db.execute(
        select(sql_func.count(Assignment.id)).where(
            Assignment.is_final_project == False,
            Assignment.lesson_id == EnrollmentLessonStatus.lesson_id,
        ).join(EnrollmentLessonStatus)
    )
    regular_assignments_total = result.scalar() or 0

    result = await db.execute(
        select(sql_func.count(Submission.id)).where(
            Submission.status == "accepted",
            Submission.assignment_id == Assignment.id,
            Assignment.is_final_project == False,
        ).join(Assignment)
    )
    accepted_regular = result.scalar() or 0

    result = await db.execute(
        select(sql_func.avg(Grade.score)).join(Submission).where(
            Submission.status == "accepted",
            Submission.assignment_id == Assignment.id,
            Assignment.is_final_project == False,
        ).join(Assignment)
    )
    avg_grade_regular = result.scalar() or 0

    final_project_status = 0
    result = await db.execute(
        select(Submission).where(
            Submission.enrollment_id == enrollment_id,
            Submission.assignment_id == Assignment.id,
            Assignment.is_final_project == True,
        ).order_by(Submission.attempt_number.desc())
    )
    final_submission = result.scalar_one_or_none()
    if final_submission:
        if final_submission.status == "accepted":
            final_project_status = 1
        elif final_submission.status in ("submitted", "needs_revision"):
            final_project_status = 0.5

    progress = (
        40 * (completed_lessons / total_lessons)
        + 40 * (accepted_regular / regular_assignments_total) * (avg_grade_regular / 100)
        + 20 * final_project_status
    )
    return round(progress, 2)

