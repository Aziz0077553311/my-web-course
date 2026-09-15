from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.utils.deps import get_current_user, require_permission
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats/overview")
async def stats_overview(db: AsyncSession = Depends(get_db)):
    pass


@router.get("/stats/students-table")
async def students_table(db: AsyncSession = Depends(get_db)):
    pass


@router.get("/logs/lesson-unlocks")
async def lesson_unlocks_log(db: AsyncSession = Depends(get_db)):
    pass


@router.get("/logs/progress-overrides")
async def progress_overrides_log(db: AsyncSession = Depends(get_db)):
    pass


@router.get("/logs/attendance-decisions")
async def attendance_decisions_log(db: AsyncSession = Depends(get_db)):
    pass

