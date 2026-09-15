from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    due_offset_sessions: int = 1
    is_final_project: bool = False


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    due_offset_sessions: Optional[int] = None
    is_final_project: Optional[bool] = None


class AssignmentOut(BaseModel):
    id: int
    lesson_id: int
    title: str
    description: Optional[str]
    requirements: Optional[str]
    due_offset_sessions: int
    is_final_project: bool

    class Config:
        from_attributes = True


class SubmissionCreate(BaseModel):
    text_answer: Optional[str] = None
    github_url: Optional[str] = None
    project_url: Optional[str] = None


class SubmissionOut(BaseModel):
    id: int
    enrollment_id: int
    assignment_id: int
    attempt_number: int
    status: str
    text_answer: Optional[str]
    github_url: Optional[str]
    project_url: Optional[str]
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GradeRequest(BaseModel):
    score: int = Field(..., ge=0, le=100)
    comment: Optional[str] = None
    decision: str

