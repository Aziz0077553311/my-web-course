from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, Integer, BigInteger, String, Text, ForeignKey, Boolean, SMALLINT, DateTime, Date, UniqueConstraint, Index
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="forming")

    teachers: Mapped[List["GroupTeacher"]] = relationship("GroupTeacher", back_populates="group", cascade="all, delete-orphan")
    enrollments: Mapped[List["Enrollment"]] = relationship("Enrollment", back_populates="group", cascade="all, delete-orphan")
    class_sessions: Mapped[List["ClassSession"]] = relationship("ClassSession", back_populates="group", cascade="all, delete-orphan")
    chat_room: Mapped[Optional["ChatRoom"]] = relationship("ChatRoom", back_populates="group", cascade="all, delete-orphan")


class GroupTeacher(Base):
    __tablename__ = "group_teachers"

    group_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("groups.id"), primary_key=True)
    teacher_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
    role_in_group: Mapped[str] = mapped_column(String(50), nullable=False, default="main")

    group: Mapped["Group"] = relationship("Group", back_populates="teachers")
    teacher: Mapped["User"] = relationship("User")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    group_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("groups.id"), nullable=False)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    student: Mapped["User"] = relationship("User", foreign_keys=[student_id])
    group: Mapped["Group"] = relationship("Group", back_populates="enrollments")
    course: Mapped["Course"] = relationship("Course")
    lesson_statuses: Mapped[List["EnrollmentLessonStatus"]] = relationship("EnrollmentLessonStatus", back_populates="enrollment", cascade="all, delete-orphan")
    unlock_logs: Mapped[List["LessonUnlockLog"]] = relationship("LessonUnlockLog", back_populates="enrollment", cascade="all, delete-orphan")
    submissions: Mapped[List["Submission"]] = relationship("Submission", back_populates="enrollment", cascade="all, delete-orphan")
    attendance_records: Mapped[List["Attendance"]] = relationship("Attendance", back_populates="enrollment", cascade="all, delete-orphan")
    invoices: Mapped[List["Invoice"]] = relationship("Invoice", back_populates="enrollment", cascade="all, delete-orphan")
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="enrollment", cascade="all, delete-orphan")
    progress: Mapped[Optional["Progress"]] = relationship("Progress", back_populates="enrollment", cascade="all, delete-orphan")

    __table_args__ = (Index("idx_enrollments_student_status", "student_id", "status"),)


class EnrollmentLessonStatus(Base):
    __tablename__ = "enrollment_lesson_status"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id"), nullable=False, index=True)
    lesson_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("lessons.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="locked")
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="lesson_statuses")
    lesson: Mapped["Lesson"] = relationship("Lesson")

    __table_args__ = (
        UniqueConstraint("enrollment_id", "lesson_id", name="uq_enrollment_lesson"),
        Index("idx_els_enrollment_status", "enrollment_id", "status"),
    )


class LessonUnlockLog(Base):
    __tablename__ = "lesson_unlock_log"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id"), nullable=False)
    lesson_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("lessons.id"), nullable=False)
    opened_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    reason: Mapped[str] = mapped_column(Text, nullable=False)

    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="unlock_logs")
    opener: Mapped["User"] = relationship("User")

