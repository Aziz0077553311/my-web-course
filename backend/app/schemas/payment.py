from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from decimal import Decimal


class InvoiceOut(BaseModel):
    id: int
    enrollment_id: int
    period_month: date
    amount: Decimal
    due_date: date
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    enrollment_id: int
    amount: Decimal
    method: Optional[str] = None
    external_ref: Optional[str] = None
    allocations: List[dict] = []


class PaymentOut(BaseModel):
    id: int
    enrollment_id: int
    amount: Decimal
    paid_at: Optional[datetime] = None
    method: Optional[str]
    external_ref: Optional[str]

    class Config:
        from_attributes = True

