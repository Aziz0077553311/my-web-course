from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, Integer, BigInteger, String, Text, ForeignKey, DateTime, UniqueConstraint, Index, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    group_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("groups.id"), nullable=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    group: Mapped[Optional["Group"]] = relationship("Group", back_populates="chat_room")
    members: Mapped[List["ChatMember"]] = relationship("ChatMember", back_populates="chat_room", cascade="all, delete-orphan")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="chat_room", cascade="all, delete-orphan")


class ChatMember(Base):
    __tablename__ = "chat_members"

    chat_room_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("chat_rooms.id"), primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)

    chat_room: Mapped["ChatRoom"] = relationship("ChatRoom", back_populates="members")
    user: Mapped["User"] = relationship("User")


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    chat_room_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("chat_rooms.id"), nullable=False, index=True)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reply_to_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("messages.id"), nullable=True)
    pinned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    edited_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    chat_room: Mapped["ChatRoom"] = relationship("ChatRoom", back_populates="messages")
    author: Mapped["User"] = relationship("User")
    reply_to: Mapped[Optional["Message"]] = relationship("Message", remote_side=[id])
    files: Mapped[List["MessageFile"]] = relationship("MessageFile", back_populates="message", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_messages_room_created", "chat_room_id", "created_at"),)


class MessageFile(Base):
    __tablename__ = "message_files"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    message_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("messages.id"), nullable=False)
    file_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("files.id"), nullable=False)

    message: Mapped["Message"] = relationship("Message", back_populates="files")
    file: Mapped["File"] = relationship("File")

