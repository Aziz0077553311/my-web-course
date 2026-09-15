from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.progress import Progress
from app.schemas.progress import ProgressOverrideRequest
from app.services.progress import recalculate_progress
from app.utils.deps import get_current_user, require_permission
from app.models.user import User

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/enrollments/{enrollment_id}/progress")
async def get_progress(enrollment_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/enrollments/{enrollment_id}/progress/override")
async def override_progress(enrollment_id: int, data: ProgressOverrideRequest, db: AsyncSession = Depends(get_db)):
    pass


@router.delete("/enrollments/{enrollment_id}/progress/override")
async def reset_progress_override(enrollment_id: int, db: AsyncSession = Depends(get_db)):
    pass

