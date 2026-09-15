from collections.abc import Awaitable, Callable
from typing import Optional

from fastapi import Depends, Request
from fastapi import HTTPException as FastAPIHTTPException
from fastapi import status

from app.db.session import get_db
from app.models.user import User
from app.utils.deps import get_current_user


PermissionCheck = Callable[..., Awaitable[bool]]


def has_permission(user: User, permission_code: str) -> bool:
    for role in user.roles:
        for perm in role.permissions:
            if perm.code == permission_code:
                return True
    return False


async def assert_can_access_enrollment(
    user: User,
    enrollment_id: int,
    action: str,
    db_session,
) -> bool:
    from sqlalchemy import exists, select
    from app.models.enrollment import Enrollment
    from app.models.group_teacher import GroupTeacher
    from app.models.parent_student import ParentStudent

    result = await db_session.execute(select(Enrollment).where(Enrollment.id == enrollment_id))
    enrollment = result.scalar_one_or_none()
    if enrollment is None:
        return False

    if action == "view":
        if user.is_admin:
            return True
        if enrollment.student_id == user.id:
            return True
        if user.is_teacher:
            result = await db_session.execute(
                select(exists().where(
                    GroupTeacher.group_id == enrollment.group_id,
                    GroupTeacher.teacher_id == user.id,
                ))
            )
            return result.scalar()
        if user.is_parent:
            result = await db_session.execute(
                select(exists().where(
                    ParentStudent.parent_id == user.id,
                    ParentStudent.student_id == enrollment.student_id,
                ))
            )
            return result.scalar()
        return False
    return False


async def require_permission(permission_code: str, resource_type: Optional[str] = None, resource_id: Optional[int] = None):
    async def wrapper(
        request: Request,
        db_session=Depends(get_db),
        current_user: User = Depends(get_current_user),
    ):
        if not has_permission(current_user, permission_code):
            raise FastAPIHTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": {"code": "FORBIDDEN", "message": "Insufficient permissions", "field": None}},
            )
        if resource_type == "enrollment" and resource_id is not None:
            ok = await assert_can_access_enrollment(current_user, resource_id, "view", db_session)
            if not ok:
                raise FastAPIHTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={"error": {"code": "FORBIDDEN", "message": "Access denied to resource", "field": None}},
                )
        return True
    return wrapper


class RoleChecker:
    def __init__(self, *allowed_roles: str):
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user: User = Depends(get_current_user)) -> bool:
        return any(role.code in self.allowed_roles for role in current_user.roles)

