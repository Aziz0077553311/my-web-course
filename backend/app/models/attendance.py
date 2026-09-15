from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, Integer, BigInteger, String, Text, ForeignKey, DateTime, UniqueConstraint, Index, Date, Time, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class ClassSession(Base):
    __tablename__ = "class_sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("groups.id"), nullable=False, index=True)
    teacher_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("lessons.id"), nullable=True)
    date: Mapped[datetime] = mapped_column(Date, nullable=False)
    start_time: Mapped[datetime] = mapped_column(Time, nullable=False)
    end_time: Mapped[datetime] = mapped_column(Time, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    format: Mapped[str] = mapped_column(String(50), nullable=False)
    location_or_link: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    group: Mapped["Group"] = relationship("Group", back_populates="class_sessions")
    teacher: Mapped["User"] = relationship("User")
    lesson: Mapped[Optional["Lesson"]] = relationship("Lesson")
    attendance_records: Mapped[List["Attendance"]] = relationship("Attendance", back_populates="class_session", cascade="all, delete-orphan")
    makeup_lessons: Mapped[List["MakeupLesson"]] = relationship("MakeupLesson", back_populates="class_session", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_class_sessions_group_date", "group_id", "date"), Index("idx_class_sessions_teacher_date", "teacher_id", "date"))


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    class_session_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("class_sessions.id"), nullable=False, index=True)
    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    marked_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    marked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    class_session: Mapped["ClassSession"] = relationship("ClassSession", back_populates="attendance_records")
    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="attendance_records")
    reason: Mapped[Optional["AttendanceReason"]] = relationship("AttendanceReason", back_populates="attendance", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("class_session_id", "enrollment_id", name="uq_attendance_session_enrollment"), Index("idx_attendance_enrollment", "enrollment_id", "class_session_id"))


class AttendanceReason(Base):
    __tablename__ = "attendance_reasons"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    attendance_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("attendance.id"), nullable=False, unique=True)
    reason_text: Mapped[str] = mapped_column(Text, nullable=False)
    decision_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    decided_by: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    decided_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    deadline_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    attendance: Mapped["Attendance"] = relationship("Attendance", back_populates="reason")
    decided_by_user: Mapped[Optional["User"]] = relationship("User")
    makeup_lesson: Mapped[Optional["MakeupLesson"]] = relationship("MakeupLesson", back_populates="attendance_reason", cascade="all, delete-orphan")


class MakeupLesson(Base):
    __tablename__ = "makeup_lessons"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    attendance_reason_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("attendance_reasons.id"), nullable=False, unique=True)
    class_session_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("class_sessions.id"), nullable=False)

    attendance_reason: Mapped["AttendanceReason"] = relationship("AttendanceReason", back_populates="makeup_lesson")
    class_session: Mapped["ClassSession"] = relationship("ClassSession", back_populates="makeup_lessons")

