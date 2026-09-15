from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import Column, Integer, BigInteger, String, Boolean, DateTime, Text, ForeignKey, Table, UniqueConstraint, Index
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    avatar_file_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("files.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    roles: Mapped[List["Role"]] = relationship("Role", secondary="user_roles", back_populates="users")
    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="user")
    student_profile: Mapped[Optional["StudentProfile"]] = relationship("StudentProfile", back_populates="user", cascade="all, delete-orphan")
    teacher_profile: Mapped[Optional["TeacherProfile"]] = relationship("TeacherProfile", back_populates="user", cascade="all, delete-orphan")
    parent_student: Mapped[List["ParentStudent"]] = relationship("ParentStudent", foreign_keys="ParentStudent.parent_id", back_populates="parent")
    owned_parent_student: Mapped[List["ParentStudent"]] = relationship("ParentStudent", foreign_keys="ParentStudent.student_id", back_populates="student")
    sent_notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user")
    files_owned: Mapped[List["File"]] = relationship("File", back_populates="owner")

    @property
    def is_admin(self) -> bool:
        return any(r.code == "ADMIN" for r in self.roles)

    @property
    def is_teacher(self) -> bool:
        return any(r.code == "TEACHER" for r in self.roles)

    @property
    def is_student(self) -> bool:
        return any(r.code == "STUDENT" for r in self.roles)

    @property
    def is_parent(self) -> bool:
        return any(r.code == "PARENT" for r in self.roles)


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    users: Mapped[List["User"]] = relationship("User", secondary="user_roles", back_populates="roles")
    permissions: Mapped[List["Permission"]] = relationship("Permission", secondary="role_permissions", back_populates="roles")


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id"), primary_key=True)


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    roles: Mapped[List["Role"]] = relationship("Role", secondary="role_permissions", back_populates="permissions")


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id"), primary_key=True)
    permission_id: Mapped[int] = mapped_column(Integer, ForeignKey("permissions.id"), primary_key=True)


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    refresh_token_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="sessions")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    telegram_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    other_links: Mapped[list] = mapped_column(Text, default="[]")

    user: Mapped["User"] = relationship("User", back_populates="student_profile")


class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
    specialization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="teacher_profile")


class ParentStudent(Base):
    __tablename__ = "parent_student"

    parent_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)

    parent: Mapped["User"] = relationship("User", foreign_keys=[parent_id], back_populates="parent_student")
    student: Mapped["User"] = relationship("User", foreign_keys=[student_id], back_populates="owned_parent_student")

