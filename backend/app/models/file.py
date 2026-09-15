from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, Integer, BigInteger, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class File(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    owner: Mapped["User"] = relationship("User")
    user_avatar: Mapped[List["User"]] = relationship("User", back_populates="avatar_file")
    lesson_materials: Mapped[List["LessonMaterial"]] = relationship("LessonMaterial", back_populates="file")
    submission_files: Mapped[List["SubmissionFile"]] = relationship("SubmissionFile", back_populates="file")
    message_files: Mapped[List["MessageFile"]] = relationship("MessageFile", back_populates="file")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    technologies: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preview_file_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("files.id"), nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    demo_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    enrollment: Mapped["Enrollment"] = relationship("Enrollment")
    preview_file: Mapped[Optional["File"]] = relationship("File")

