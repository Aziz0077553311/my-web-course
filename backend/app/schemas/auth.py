from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class UserProfile(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    avatar_file_id: Optional[int] = None
    is_active: bool
    roles: list[str] = []
    permissions: list[str] = []


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

