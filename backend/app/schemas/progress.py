from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProgressOut(BaseModel):
    id: int
    enrollment_id: int
    progress_calculated: float
    progress_override: Optional[float]
    override_reason: Optional[str]
    override_by: Optional[int]
    override_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProgressOverrideRequest(BaseModel):
    value: float
    reason: str


class RecalculateProgressResponse(BaseModel):
    progress_calculated: float

