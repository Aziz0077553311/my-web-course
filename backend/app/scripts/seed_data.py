import asyncio
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from datetime import datetime, date, timezone

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select

from app.db.base import Base
from app.db.session import engine, async_session
from app.core.security import hash_password
from app.models import *

COURSE_NAME = "Full Stack Development + Machine Learning"
COURSE_DESCRIPTION = "3-\u043c\u0435\u0441\u044f\u0447\u043d\u044b\u0439 \u0438\u043d\u0442\u0435\u043d\u0441\u0438\u0432\u043d\u044b\u0439 \u043a\u0443\u0440\u0441: \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435, HTML, CSS, JavaScript, React, Python/Backend \u0438 Machine Learning"
COURSE_DURATION_MONTHS = 3
GROUP_NAME = "Frontend \u00b7 09:00"
GROUP_START_DATE = date(2026, 9, 1)
DEMO_PASSWORD = "demo123"
LESSON_TITLES = [
    "Что такое программирование и как работает компьютер",
    "Переменные и типы данных",
    "Условия и операторы",
    "Циклы и массивы",
    "Функции, строки и ошибки",
    "Структура HTML-документа",
    "Ссылки и изображения",
    "Списки и таблицы",
    "Формы, input и button",
    "Semantic HTML и проект",
    "Основы CSS и селекторы",
    "Цвета, шрифты и размеры",
    "Box model: margin, padding, border",
    "Flexbox",
    "Grid и position",
    "Адаптивность и анимации",
    "JavaScript: переменные и типы",
    "Условия и циклы",
    "Функции",
    "Массивы и объекты",
    "DOM и события",
    "Формы и localStorage",
    "Асинхронность и Fetch API",
    "Работа с API и проект",
    "React, JSX и компоненты",
    "Props",
    "State и события",
    "Формы и списки в React",
    "Условный рендеринг",
    "Хуки useState и useEffect",
    "API и React Router",
    "Frontend-проект",
    "Основы Python",
    "Функции и структуры данных",
    "Файлы, модули и исключения",
    "ООП на Python",
    "HTTP, client/server и REST API",
    "FastAPI: роуты и ответы",
    "CRUD, PostgreSQL и SQLAlchemy",
    "Authentication и backend-проект",
    "Что такое AI, ML и DL",
    "NumPy",
    "Pandas",
    "Визуализация и статистика",
    "Регрессия",
    "Классификация",
    "Деревья решений и метрики",
    "Train/test split и переобучение",
    "Введение в нейронные сети",
    "Финальный ML-проект",
]

FINAL_PROJECT_LESSON_NUMBERS = [5, 10, 16, 24, 32, 40, 50]

MODULE_TITLES = [
    ("Основы программирования", 1, 5),
    ("HTML", 6, 10),
    ("CSS", 11, 16),
    ("JavaScript", 17, 24),
    ("React", 25, 32),
    ("Python и backend", 33, 40),
    ("Machine Learning", 41, 50),
]

PERMISSIONS = [
    "lesson.view",
    "lesson.unlock_early",
    "lesson.manage_content",
    "submission.view_own",
    "submission.view_group",
    "submission.grade",
    "progress.view_own",
    "progress.view_group",
    "progress.override",
    "attendance.mark",
    "attendance.decide",
    "invoice.manage",
    "payment.record",
    "group.manage_teachers",
    "chat.moderate",
    "admin.full_access",
    "user.manage_roles",
]

ROLE_PERMISSIONS = {
    "ADMIN": PERMISSIONS,
    "TEACHER": [
        "lesson.view",
        "lesson.unlock_early",
        "submission.view_own",
        "submission.view_group",
        "submission.grade",
        "progress.view_own",
        "progress.view_group",
        "progress.override",
        "attendance.mark",
        "attendance.decide",
        "group.manage_teachers",
        "chat.moderate",
    ],
    "STUDENT": [
        "lesson.view",
        "submission.view_own",
        "progress.view_own",
    ],
    "PARENT": [
        "progress.view_own",
    ],
}
async def seed(db):
    async with db() as session:
        async with session.begin():
            await seed_roles(session)
            await seed_permissions(session)
            await seed_role_permissions(session)
            await seed_course(session)
            await seed_users(session)
            await seed_group(session)
            await seed_enrollment(session)
            await seed_chat_rooms(session)


async def seed_roles(session):
    role_codes = ["ADMIN", "TEACHER", "STUDENT", "PARENT"]
    result = await session.execute(select(Role).where(Role.code.in_(role_codes)))
    existing = result.scalars().all()
    existing_codes = {r.code for r in existing}
    for code in role_codes:
        if code not in existing_codes:
            session.add(Role(code=code))


async def seed_permissions(session):
    result = await session.execute(select(Permission))
    existing = {p.code for p in result.scalars().all()}
    for code in PERMISSIONS:
        if code not in existing:
            session.add(Permission(code=code))


async def seed_role_permissions(session):
    result = await session.execute(select(Role))
    roles = {r.code: r for r in result.scalars().all()}
    result = await session.execute(select(Permission))
    permissions = {p.code: p for p in result.scalars().all()}
    for role_code, perm_codes in ROLE_PERMISSIONS.items():
        role = roles.get(role_code)
        if not role:
            continue
        for perm_code in perm_codes:
            perm = permissions.get(perm_code)
            if not perm:
                continue
            exists = await session.execute(
                select(RolePermission).where(
                    RolePermission.role_id == role.id,
                    RolePermission.permission_id == perm.id,
                )
            )
            if not exists.scalar_one_or_none():
                session.add(RolePermission(role_id=role.id, permission_id=perm.id))
async def seed_course(session):
    result = await session.execute(select(Course).where(Course.name == COURSE_NAME))
    course = result.scalar_one_or_none()
    if course:
        return

    course = Course(
        name=COURSE_NAME,
        description=COURSE_DESCRIPTION,
        duration_months=COURSE_DURATION_MONTHS,
        is_active=True,
    )
    session.add(course)
    await session.flush()

    for module_title, start, end in MODULE_TITLES:
        module = Module(
            course_id=course.id,
            title=module_title,
            order_index=start,
        )
        session.add(module)
        await session.flush()

        for i in range(start, end + 1):
            lesson_index = i - 1
            title = LESSON_TITLES[lesson_index]
            is_final = i in FINAL_PROJECT_LESSON_NUMBERS
            lesson_type = "final_project" if is_final else "theory"

            lesson = Lesson(
                module_id=module.id,
                title=title,
                order_index=i,
                lesson_type=lesson_type,
            )
            session.add(lesson)
            await session.flush()

            assignment_title = f"Практика: {title}"
            assignment = Assignment(
                lesson_id=lesson.id,
                title=assignment_title,
                is_final_project=is_final,
                due_offset_sessions=1,
            )
            session.add(assignment)
            await session.flush()
async def seed_users(session):
    users_data = [
        ("student@demo.com", "Demo Student", "STUDENT"),
        ("teacher@demo.com", "Demo Teacher", "TEACHER"),
        ("admin@demo.com", "Demo Admin", "ADMIN"),
    ]

    for email, full_name, role_code in users_data:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            continue

        user = User(
            email=email,
            password_hash=hash_password(DEMO_PASSWORD),
            full_name=full_name,
            is_active=True,
        )
        session.add(user)
        await session.flush()

        result = await session.execute(select(Role).where(Role.code == role_code))
        role = result.scalar_one_or_none()
        if role and not user.roles:
            user.roles.append(role)


async def seed_group(session):
    result = await session.execute(select(Group).where(Group.name == GROUP_NAME))
    group = result.scalar_one_or_none()
    if group:
        return group

    result = await session.execute(select(Course).where(Course.name == COURSE_NAME))
    course = result.scalar_one_or_none()

    result = await session.execute(select(User).where(User.email == "teacher@demo.com"))
    teacher = result.scalar_one_or_none()

    group = Group(
        course_id=course.id if course else 1,
        name=GROUP_NAME,
        start_date=GROUP_START_DATE,
        status="forming",
    )
    session.add(group)
    await session.flush()

    if teacher:
        session.add(GroupTeacher(group_id=group.id, teacher_id=teacher.id, role_in_group="main"))

    return group
async def seed_enrollment(session):
    result = await session.execute(select(Enrollment).where(
        Enrollment.student_id == select(User).where(User.email == "student@demo.com").scalar_subquery(),
    ))
    enrollment = result.scalar_one_or_none()
    if enrollment:
        return enrollment

    result = await session.execute(select(User).where(User.email == "student@demo.com"))
    student = result.scalar_one_or_none()
    result = await session.execute(select(Group).where(Group.name == GROUP_NAME))
    group = result.scalar_one_or_none()
    result = await session.execute(select(Course).where(Course.name == COURSE_NAME))
    course = result.scalar_one_or_none()

    if not student or not group or not course:
        return None

    enrollment = Enrollment(
        student_id=student.id,
        group_id=group.id,
        course_id=course.id,
        status="active",
    )
    session.add(enrollment)
    await session.flush()

    result = await session.execute(select(Lesson).order_by(Lesson.order_index))
    lessons = result.scalars().all()

    for idx, lesson in enumerate(lessons):
        status = "available" if idx == 0 else "locked"
        els = EnrollmentLessonStatus(
            enrollment_id=enrollment.id,
            lesson_id=lesson.id,
            status=status,
        )
        session.add(els)

    progress = Progress(
        enrollment_id=enrollment.id,
        progress_calculated=0,
    )
    session.add(progress)
    await session.flush()

    return enrollment


async def seed_chat_rooms(session):
    result = await session.execute(select(Group).where(Group.name == GROUP_NAME))
    group = result.scalar_one_or_none()

    result = await session.execute(select(User).where(User.email == "teacher@demo.com"))
    teacher = result.scalar_one_or_none()
    result = await session.execute(select(User).where(User.email == "student@demo.com"))
    student = result.scalar_one_or_none()

    if group:
        result = await session.execute(select(ChatRoom).where(ChatRoom.group_id == group.id))
        group_chat = result.scalar_one_or_none()
        if not group_chat:
            group_chat = ChatRoom(
                group_id=group.id,
                type="group",
                name=f"Чат - {GROUP_NAME}",
            )
            session.add(group_chat)
            await session.flush()

            if teacher:
                session.add(ChatMember(chat_room_id=group_chat.id, user_id=teacher.id))
            if student:
                session.add(ChatMember(chat_room_id=group_chat.id, user_id=student.id))

    result = await session.execute(select(ChatRoom).where(ChatRoom.type == "general"))
    general_chat = result.scalar_one_or_none()
    if not general_chat:
        general_chat = ChatRoom(
            group_id=None,
            type="general",
            name="Общий чат",
        )
        session.add(general_chat)
        await session.flush()

        if teacher:
            session.add(ChatMember(chat_room_id=general_chat.id, user_id=teacher.id))
        if student:
            session.add(ChatMember(chat_room_id=general_chat.id, user_id=student.id))
async def main():
    await seed(async_session)
    print("Seed data created successfully.")


if __name__ == "__main__":
    asyncio.run(main())