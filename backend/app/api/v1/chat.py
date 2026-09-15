from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.chat import ChatRoom, Message
from app.schemas.chat import SendMessageRequest
from app.utils.deps import get_current_user
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/chat-rooms")
async def list_chat_rooms(db: AsyncSession = Depends(get_db)):
    pass


@router.get("/chat-rooms/{room_id}/messages")
async def get_messages(room_id: int, before: Optional[int] = None, limit: int = 50, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/chat-rooms/{room_id}/messages")
async def send_message(room_id: int, data: SendMessageRequest, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/chat-rooms/{room_id}/messages/{msg_id}/pin")
async def pin_message(room_id: int, msg_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.delete("/chat-rooms/{room_id}/messages/{msg_id}")
async def delete_message(room_id: int, msg_id: int, db: AsyncSession = Depends(get_db)):
    pass

