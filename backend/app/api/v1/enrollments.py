from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.enrollment import Enrollment
from app.schemas.enrollment import EnrollmentCreate, EnrollmentUpdate, EnrollmentOut
from app.utils.deps import get_current_user, require_permission
from app.models.user import User

router = APIRouter(prefix="/enrollments", tags=["enrollments"])


@router.post("/")
async def create_enrollment(data: EnrollmentCreate, db: AsyncSession = Depends(get_db)):
    pass


@router.get("/{enrollment_id}")
async def get_enrollment(enrollment_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.patch("/{enrollment_id}")
async def update_enrollment(enrollment_id: int, data: EnrollmentUpdate, db: AsyncSession = Depends(get_db)):
    pass

