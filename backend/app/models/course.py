from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, Integer, BigInteger, String, Text, ForeignKey, Boolean, SmallInteger, DateTime, UniqueConstraint, Index
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_months: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    modules: Mapped[List["Module"]] = relationship("Module", back_populates="course", cascade="all, delete-orphan")


class Module(Base):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    order_index: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    lessons: Mapped[List["Lesson"]] = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_modules_course_order", "course_id", "order_index"),)


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content_md: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    order_index: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    lesson_type: Mapped[str] = mapped_column(String(50), nullable=False, default="theory")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    module: Mapped["Module"] = relationship("Module", back_populates="lessons")
    materials: Mapped[List["LessonMaterial"]] = relationship("LessonMaterial", back_populates="lesson", cascade="all, delete-orphan")
    assignment: Mapped[Optional["Assignment"]] = relationship("Assignment", back_populates="lesson", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_lessons_module_order", "module_id", "order_index"),)


class LessonMaterial(Base):
    __tablename__ = "lesson_materials"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("files.id"), nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)

    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="materials")

