from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.payment import Invoice, Payment
from app.schemas.payment import PaymentCreate
from app.utils.deps import get_current_user, require_permission
from app.models.user import User

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/invoices")
async def create_invoice(db: AsyncSession = Depends(get_db)):
    pass


@router.get("/enrollments/{enrollment_id}/invoices")
async def get_invoices(enrollment_id: int, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/payments")
async def create_payment(data: PaymentCreate, db: AsyncSession = Depends(get_db)):
    pass

