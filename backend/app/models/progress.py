from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, Integer, BigInteger, String, Text, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Progress(Base):
    __tablename__ = "progress"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id"), nullable=False, unique=True)
    progress_calculated: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0)
    progress_override: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    override_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    override_by: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    override_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="progress")
    override_by_user: Mapped[Optional["User"]] = relationship("User")


class ProgressOverrideLog(Base):
    __tablename__ = "progress_override_log"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id"), nullable=False)
    old_value: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    new_value: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    changed_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    changed_by_user: Mapped["User"] = relationship("User")

