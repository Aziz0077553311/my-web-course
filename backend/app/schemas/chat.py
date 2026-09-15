from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatRoomOut(BaseModel):
    id: int
    group_id: Optional[int]
    type: str
    name: str

    class Config:
        from_attributes = True


class MessageOut(BaseModel):
    id: int
    chat_room_id: int
    author_id: int
    text: Optional[str]
    reply_to_id: Optional[int]
    pinned: bool
    created_at: Optional[datetime] = None
    edited_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    chat_room_id: int
    text: Optional[str] = None
    reply_to_id: Optional[int] = None
    file_ids: List[int] = []


class ChatMessageIn(BaseModel):
    text: Optional[str] = None
    reply_to_id: Optional[int] = None
    file_ids: List[int] = []

