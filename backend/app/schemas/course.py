from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class CourseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    duration_months: int


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_months: Optional[int] = None
    is_active: Optional[bool] = None


class CourseOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    duration_months: int
    is_active: bool

    class Config:
        from_attributes = True


class ModuleCreate(BaseModel):
    title: str
    order_index: int


class ModuleOut(BaseModel):
    id: int
    course_id: int
    title: str
    order_index: int

    class Config:
        from_attributes = True


class LessonCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content_md: Optional[str] = None
    video_url: Optional[str] = None
    order_index: int
    lesson_type: str = "theory"


class LessonOut(BaseModel):
    id: int
    module_id: int
    title: str
    description: Optional[str]
    content_md: Optional[str]
    video_url: Optional[str]
    order_index: int
    lesson_type: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class LessonDetailOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    content_md: Optional[str]
    video_url: Optional[str]
    order_index: int
    lesson_type: str
    materials: list = []
    assignment: Optional[dict] = None
    status: Optional[str] = None

