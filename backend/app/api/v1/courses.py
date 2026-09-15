from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.course import Course, Module, Lesson
from app.schemas.course import CourseCreate, CourseUpdate, CourseOut, ModuleCreate, LessonCreate, LessonOut, LessonDetailOut
from app.utils.deps import get_current_user, require_permission
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/")
async def list_courses(db: AsyncSession = Depends(get_db)):
    pass


@router.get("/{course_id}")
async def get_course(course_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.get("/{course_id}/modules")
async def get_modules(course_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/")
async def create_course(data: CourseCreate, db: AsyncSession = Depends(get_db)):
    pass


@router.patch("/{course_id}")
async def update_course(course_id: int, data: CourseUpdate, db: AsyncSession = Depends(get_db)):
    pass


@router.delete("/{course_id}")
async def delete_course(course_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/modules")
async def create_module(data: ModuleCreate, db: AsyncSession = Depends(get_db)):
    pass


@router.patch("/modules/{module_id}")
async def update_module(module_id: int, data: ModuleCreate, db: AsyncSession = Depends(get_db)):
    pass


@router.delete("/modules/{module_id}")
async def delete_module(module_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/lessons")
async def create_lesson(data: LessonCreate, db: AsyncSession = Depends(get_db)):
    pass


@router.patch("/lessons/{lesson_id}")
async def update_lesson(lesson_id: int, data: LessonCreate, db: AsyncSession = Depends(get_db)):
    pass


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(lesson_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.get("/enrollments/{enrollment_id}/lessons")
async def get_enrollment_lessons(enrollment_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.get("/lessons/{lesson_id}")
async def get_lesson_detail(lesson_id: int, enrollment_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/enrollments/{enrollment_id}/lessons/{lesson_id}/complete")
async def complete_lesson(enrollment_id: int, lesson_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/enrollments/{enrollment_id}/lessons/{lesson_id}/unlock-early")
async def early_unlock(enrollment_id: int, lesson_id: int, db: AsyncSession = Depends(get_db)):
    pass

