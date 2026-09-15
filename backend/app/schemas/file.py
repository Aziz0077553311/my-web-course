from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FileCreate(BaseModel):
    filename: str
    mime_type: str
    size_bytes: int
    storage_key: str


class FileOut(BaseModel):
    id: int
    owner_id: int
    filename: str
    mime_type: str
    size_bytes: int
    storage_key: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

