from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, Integer, BigInteger, String, Text, ForeignKey, SMALLINT, Boolean, DateTime, UniqueConstraint, Index
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    lesson_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("lessons.id"), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_offset_sessions: Mapped[int] = mapped_column(SMALLINT, nullable=False, default=1)
    is_final_project: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="assignment")
    submissions: Mapped[List["Submission"]] = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id"), nullable=False, index=True)
    assignment_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("assignments.id"), nullable=False)
    attempt_number: Mapped[int] = mapped_column(SMALLINT, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="submitted")
    text_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    project_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="submissions")
    assignment: Mapped["Assignment"] = relationship("Assignment", back_populates="submissions")
    files: Mapped[List["SubmissionFile"]] = relationship("SubmissionFile", back_populates="submission", cascade="all, delete-orphan")
    grade: Mapped[Optional["Grade"]] = relationship("Grade", back_populates="submission", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("enrollment_id", "assignment_id", "attempt_number", name="uq_enrollment_assignment_attempt"), Index("idx_submissions_assignment_status", "assignment_id", "status"))


class SubmissionFile(Base):
    __tablename__ = "submission_files"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    submission_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("submissions.id"), nullable=False)
    file_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("files.id"), nullable=False)

    submission: Mapped["Submission"] = relationship("Submission", back_populates="files")
    file: Mapped["File"] = relationship("File")


class Grade(Base):
    __tablename__ = "grades"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    submission_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("submissions.id"), nullable=False, unique=True)
    score: Mapped[int] = mapped_column(SMALLINT, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    graded_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    graded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    submission: Mapped["Submission"] = relationship("Submission", back_populates="grade")
    grader: Mapped["User"] = relationship("User")

