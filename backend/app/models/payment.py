from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, Integer, BigInteger, String, Text, ForeignKey, DateTime, UniqueConstraint, Index, Numeric, Date
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id"), nullable=False, index=True)
    period_month: Mapped[datetime] = mapped_column(Date, nullable=False)
    amount: Mapped[str] = mapped_column(Numeric(10, 2), nullable=False)
    due_date: Mapped[datetime] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    adjustment_reason_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("attendance_reasons.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="invoices")
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="invoice")
    adjustment_reason: Mapped[Optional["AttendanceReason"]] = relationship("AttendanceReason")

    __table_args__ = (UniqueConstraint("enrollment_id", "period_month", name="uq_enrollment_period"), Index("idx_invoices_enrollment_status", "enrollment_id", "status"))


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    enrollment_id: Mapped[int] = mapped_column(Integer, ForeignKey("enrollments.id"), nullable=False)
    amount: Mapped[str] = mapped_column(Numeric(10, 2), nullable=False)
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    method: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    external_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="payments")
    allocations: Mapped[List["PaymentAllocation"]] = relationship("PaymentAllocation", back_populates="payment", cascade="all, delete-orphan")


class PaymentAllocation(Base):
    __tablename__ = "payment_allocations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    payment_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("payments.id"), nullable=False)
    invoice_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("invoices.id"), nullable=False)
    amount: Mapped[str] = mapped_column(Numeric(10, 2), nullable=False)

    payment: Mapped["Payment"] = relationship("Payment", back_populates="allocations")
    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="payments")

    __table_args__ = (UniqueConstraint("payment_id", "invoice_id", name="uq_payment_invoice"), Index("idx_payment_allocation_invoice", "invoice_id"))

