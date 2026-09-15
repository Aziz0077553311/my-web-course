from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.assignment import Assignment, Submission
from app.schemas.assignment import AssignmentCreate, SubmissionCreate, GradeRequest
from app.utils.deps import get_current_user, require_permission
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("/enrollments/{enrollment_id}/submissions")
async def list_submissions(enrollment_id: int, status: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/enrollments/{enrollment_id}/assignments/{assignment_id}/submissions")
async def submit(enrollment_id: int, assignment_id: int, data: SubmissionCreate, db: AsyncSession = Depends(get_db)):
    pass


@router.get("/submissions/{submission_id}")
async def get_submission(submission_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/submissions/{submission_id}/grade")
async def grade(submission_id: int, data: GradeRequest, db: AsyncSession = Depends(get_db)):
    pass

