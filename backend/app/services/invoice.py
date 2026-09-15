from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.invoice import Invoice
from app.models.enrollment import Enrollment


async def generate_monthly_invoices(db: AsyncSession):
    first_of_month = date.today().replace(day=1)

    result = await db.execute(
        select(Enrollment).where(Enrollment.status == "active")
    )
    enrollments = result.scalars().all()

    for enrollment in enrollments:
        result = await db.execute(
            select(Invoice).where(
                Invoice.enrollment_id == enrollment.id,
                Invoice.period_month == first_of_month,
            )
        )
        existing = result.scalar_one_or_none()
        if not existing:
            invoice = Invoice(
                enrollment_id=enrollment.id,
                period_month=first_of_month,
                amount=0,
                due_date=date.today(),
            )
            db.add(invoice)


async def mark_overdue_invoices(db: AsyncSession):
    now = datetime.now()
    result = await db.execute(
        select(Invoice).where(
            Invoice.status == "pending",
            Invoice.due_date < now,
        )
    )
    invoices = result.scalars().all()
    for invoice in invoices:
        invoice.status = "overdue"

