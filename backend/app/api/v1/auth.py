from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.session import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    decode_token, generate_refresh_token, hash_token,
)
from app.core.config import settings
from app.models.user import User, UserRole
from app.utils.deps import get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, RefreshRequest, PasswordResetRequest, PasswordResetConfirm

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    pass


@router.post("/refresh")
async def refresh(data: RefreshRequest):
    pass


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    pass


@router.post("/logout-all")
async def logout_all(current_user: User = Depends(get_current_user)):
    pass


@router.post("/password-reset/request")
async def password_reset_request(data: PasswordResetRequest):
    pass


@router.post("/password-reset/confirm")
async def password_reset_confirm(data: PasswordResetConfirm):
    pass


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    pass

