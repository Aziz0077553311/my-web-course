# EduFlow — Backend Specification v1

Детальная спецификация серверной части под фронтенд и ТЗ из `EduFlow_TZ_v3_unified.md`, с учётом всех правок (enrollment-based статус урока, `class_sessions`, `payment_allocations`, `permissions`/`group_teachers`, исправленная формула прогресса).

Стек: Python + FastAPI, PostgreSQL + SQLAlchemy (+ Alembic для миграций), Redis (кэш + очередь фоновых задач), WebSocket (FastAPI native / отдельный сервис), S3-совместимое object storage для файлов.

---

## 1. Полная схема БД

Нотация: `PK` — первичный ключ, `FK->table` — внешний ключ, `UQ` — уникальность, `IDX` — рекомендуемый индекс.

### 1.1 Пользователи, роли, права

```sql
users (
  id                 PK BIGSERIAL,
  email              TEXT UQ NOT NULL,
  password_hash      TEXT NOT NULL,
  full_name          TEXT NOT NULL,
  phone              TEXT NULL,
  avatar_file_id     FK->files NULL,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
)
IDX: email

roles (
  id    PK SMALLSERIAL,
  code  TEXT UQ NOT NULL   -- ADMIN | TEACHER | STUDENT | PARENT
)

user_roles (
  user_id  FK->users, role_id FK->roles,
  PK(user_id, role_id)
)

permissions (
  id    PK SMALLSERIAL,
  code  TEXT UQ NOT NULL   -- напр. 'lesson.unlock_early', 'submission.grade'
)

role_permissions (
  role_id FK->roles, permission_id FK->permissions,
  PK(role_id, permission_id)
)

sessions (
  id                 PK BIGSERIAL,
  user_id            FK->users NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  user_agent         TEXT,
  ip                 INET,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at         TIMESTAMPTZ NOT NULL,
  revoked_at         TIMESTAMPTZ NULL
)
IDX: user_id, refresh_token_hash

password_reset_tokens (
  id          PK BIGSERIAL,
  user_id     FK->users NOT NULL,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ NULL
)

student_profiles (
  user_id       PK FK->users,
  bio           TEXT,
  github_url    TEXT,
  telegram_url  TEXT,
  other_links   JSONB DEFAULT '[]'
)

teacher_profiles (
  user_id         PK FK->users,
  specialization  TEXT,
  bio             TEXT
)

parent_student (
  parent_id  FK->users, student_id FK->users,
  PK(parent_id, student_id)
)
```

### 1.2 Курс, программа

```sql
courses (
  id BIGSERIAL PK, name TEXT NOT NULL, description TEXT,
  duration_months SMALLINT NOT NULL, is_active BOOLEAN DEFAULT true
)

modules (
  id BIGSERIAL PK, course_id FK->courses NOT NULL,
  title TEXT NOT NULL, order_index SMALLINT NOT NULL
)
IDX: (course_id, order_index)

lessons (
  id BIGSERIAL PK, module_id FK->modules NOT NULL,
  title TEXT NOT NULL, description TEXT, content_md TEXT,
  video_url TEXT, order_index SMALLINT NOT NULL,
  lesson_type TEXT NOT NULL DEFAULT 'theory',  -- theory | project | final_project
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
)
IDX: (module_id, order_index)

lesson_materials (
  id BIGSERIAL PK, lesson_id FK->lessons NOT NULL,
  type TEXT NOT NULL,        -- file | link
  file_id FK->files NULL, url TEXT NULL, title TEXT NOT NULL
)
```

### 1.3 Группы, зачисление, преподаватели

```sql
groups (
  id BIGSERIAL PK, course_id FK->courses NOT NULL,
  name TEXT NOT NULL, start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'forming'   -- forming | active | finished
)

group_teachers (
  group_id FK->groups, teacher_id FK->users,
  role_in_group TEXT NOT NULL DEFAULT 'main',  -- main | assistant
  PK(group_id, teacher_id)
)

enrollments (
  id BIGSERIAL PK,
  student_id FK->users NOT NULL,
  group_id   FK->groups NOT NULL,
  course_id  FK->courses NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',  -- active | paused | completed | expelled
  enrolled_at  TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ NULL
)
IDX: student_id, group_id, (student_id, status)

-- статус прохождения урока — ПЕРСОНАЛЬНЫЙ, привязан к enrollment, не к lessons
enrollment_lesson_status (
  id BIGSERIAL PK,
  enrollment_id FK->enrollments NOT NULL,
  lesson_id     FK->lessons NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked',  -- locked | available | in_progress | completed
  completed_at TIMESTAMPTZ NULL,
  UQ(enrollment_id, lesson_id)
)
IDX: (enrollment_id, lesson_id), (enrollment_id, status)

lesson_unlock_log (
  id BIGSERIAL PK,
  enrollment_id FK->enrollments NOT NULL,
  lesson_id     FK->lessons NOT NULL,
  opened_by     FK->users NOT NULL,
  opened_at     TIMESTAMPTZ DEFAULT now(),
  reason        TEXT NOT NULL
)
```

### 1.4 Задания и сдачи

```sql
assignments (
  id BIGSERIAL PK,
  lesson_id FK->lessons NOT NULL UQ,
  title TEXT NOT NULL, description TEXT, requirements TEXT,
  due_offset_sessions SMALLINT NOT NULL DEFAULT 1,  -- сколько занятий даётся на сдачу
  is_final_project BOOLEAN NOT NULL DEFAULT false
)

submissions (
  id BIGSERIAL PK,
  enrollment_id FK->enrollments NOT NULL,
  assignment_id FK->assignments NOT NULL,
  attempt_number SMALLINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',  -- submitted | needs_revision | accepted | overdue
  text_answer TEXT, github_url TEXT, project_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UQ(enrollment_id, assignment_id, attempt_number)
)
IDX: (enrollment_id, assignment_id), (assignment_id, status)

submission_files (
  id BIGSERIAL PK, submission_id FK->submissions NOT NULL, file_id FK->files NOT NULL
)

grades (
  id BIGSERIAL PK,
  submission_id FK->submissions NOT NULL UQ,
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  comment TEXT,
  graded_by FK->users NOT NULL,
  graded_at TIMESTAMPTZ DEFAULT now()
)
```

### 1.5 Расписание и посещаемость

```sql
class_sessions (
  id BIGSERIAL PK,
  group_id FK->groups NOT NULL,
  teacher_id FK->users NOT NULL,
  lesson_id FK->lessons NULL,          -- если занятие = конкретный урок каталога
  date DATE NOT NULL, start_time TIME NOT NULL, end_time TIME NOT NULL,
  type TEXT NOT NULL,                  -- lesson | call | makeup | other
  format TEXT NOT NULL,                -- offline | online
  location_or_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)
IDX: (group_id, date), (teacher_id, date)

attendance (
  id BIGSERIAL PK,
  class_session_id FK->class_sessions NOT NULL,
  enrollment_id    FK->enrollments NOT NULL,
  status TEXT NOT NULL,  -- present | absent | excused_pending | excused_makeup | excused_payment_adjustment | absent_unresolved
  marked_by FK->users NOT NULL,
  marked_at TIMESTAMPTZ DEFAULT now(),
  UQ(class_session_id, enrollment_id)
)
IDX: enrollment_id, class_session_id

attendance_reasons (
  id BIGSERIAL PK,
  attendance_id FK->attendance NOT NULL UQ,
  reason_text TEXT NOT NULL,
  decision_type TEXT NULL,   -- makeup_lesson | payment_adjustment
  decided_by FK->users NULL,
  decided_at TIMESTAMPTZ NULL,
  deadline_at TIMESTAMPTZ NOT NULL   -- marked_at + 7 дней, считается при создании
)
IDX: deadline_at  -- для фонового джоба

makeup_lessons (
  id BIGSERIAL PK,
  attendance_reason_id FK->attendance_reasons NOT NULL UQ,
  class_session_id FK->class_sessions NOT NULL  -- новая сессия, созданная под отработку
)
```

### 1.6 Оплата

```sql
invoices (
  id BIGSERIAL PK,
  enrollment_id FK->enrollments NOT NULL,
  period_month DATE NOT NULL,           -- первое число месяца, за который начислено
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | overdue
  adjustment_reason_id FK->attendance_reasons NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UQ(enrollment_id, period_month)
)
IDX: (enrollment_id, status), due_date

payments (
  id BIGSERIAL PK,
  enrollment_id FK->enrollments NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  paid_at TIMESTAMPTZ DEFAULT now(),
  method TEXT, external_ref TEXT
)

payment_allocations (
  id BIGSERIAL PK,
  payment_id FK->payments NOT NULL,
  invoice_id FK->invoices NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  UQ(payment_id, invoice_id)
)
IDX: invoice_id
```

### 1.7 Прогресс

```sql
progress (
  id BIGSERIAL PK,
  enrollment_id FK->enrollments NOT NULL UQ,
  progress_calculated NUMERIC(5,2) NOT NULL DEFAULT 0,
  progress_override NUMERIC(5,2) NULL,
  override_reason TEXT NULL,
  override_by FK->users NULL,
  override_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
)

progress_override_log (
  id BIGSERIAL PK,
  enrollment_id FK->enrollments NOT NULL,
  old_value NUMERIC(5,2), new_value NUMERIC(5,2),
  reason TEXT NOT NULL,
  changed_by FK->users NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
)
```

### 1.8 Чат

```sql
chat_rooms (
  id BIGSERIAL PK,
  group_id FK->groups NULL,   -- NULL = платформенный «Общий чат»
  type TEXT NOT NULL,         -- group | general
  name TEXT NOT NULL
)

chat_members (
  chat_room_id FK->chat_rooms, user_id FK->users,
  PK(chat_room_id, user_id)
)

messages (
  id BIGSERIAL PK,
  chat_room_id FK->chat_rooms NOT NULL,
  author_id FK->users NOT NULL,
  text TEXT,
  reply_to_id FK->messages NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  edited_at TIMESTAMPTZ NULL,
  deleted_at TIMESTAMPTZ NULL
)
IDX: (chat_room_id, created_at)

message_files (
  id BIGSERIAL PK, message_id FK->messages NOT NULL, file_id FK->files NOT NULL
)
```

### 1.9 Уведомления, файлы, проекты

```sql
notifications (
  id BIGSERIAL PK, user_id FK->users NOT NULL,
  type TEXT NOT NULL, payload JSONB NOT NULL DEFAULT '{}',
  channel TEXT NOT NULL DEFAULT 'in_app',  -- in_app | email | telegram
  read_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now()
)
IDX: (user_id, read_at)

files (
  id BIGSERIAL PK, owner_id FK->users NOT NULL,
  filename TEXT NOT NULL, mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL, storage_key TEXT NOT NULL UQ,
  created_at TIMESTAMPTZ DEFAULT now()
)

projects (
  id BIGSERIAL PK, enrollment_id FK->enrollments NOT NULL,
  title TEXT NOT NULL, description TEXT, technologies TEXT[],
  preview_file_id FK->files NULL, github_url TEXT, demo_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false
)
```

---

## 2. Аутентификация и права доступа

### 2.1 Поток авторизации

1. `POST /auth/login` (email, password) → проверка `password_hash` (argon2id) → выдаётся **access token** (JWT, TTL 15 минут, содержит `user_id`, `roles`) и **refresh token** (случайная строка, TTL 30 дней, хранится в `sessions.refresh_token_hash` в виде хэша, не в открытом виде).
2. Access token передаётся в `Authorization: Bearer`.
3. `POST /auth/refresh` (refresh token) → проверка в `sessions` (не отозван, не истёк) → новый access token, ротация refresh token (старый помечается `revoked_at`, выдаётся новый — защита от replay).
4. `POST /auth/logout` → `revoked_at = now()` для текущей сессии.
5. `POST /auth/logout-all` → `revoked_at = now()` для всех сессий пользователя (пункт «выход со всех устройств» из ТЗ).
6. Восстановление пароля: `POST /auth/password-reset/request` (email) → создаётся `password_reset_tokens`, ссылка отправляется на email; `POST /auth/password-reset/confirm` (token, new_password) → проверка `expires_at`/`used_at`, обновление `password_hash`, отзыв всех `sessions` пользователя.

### 2.2 RBAC — два уровня проверки

**Уровень 1 — permission (глобальный).** Мидлварь на каждый эндпоинт проверяет: есть ли у одной из ролей пользователя (`user_roles` → `role_permissions`) нужный `permission.code`. Пример кодов:

```
lesson.view, lesson.unlock_early, lesson.manage_content
submission.view_own, submission.view_group, submission.grade
progress.view_own, progress.view_group, progress.override
attendance.mark, attendance.decide
invoice.manage, payment.record
group.manage_teachers
chat.moderate
admin.full_access
user.manage_roles
```

**Уровень 2 — row-level (по конкретной записи).** Наличие permission ещё не значит доступ к любой записи:

- `TEACHER` с `submission.grade` может проверять сдачу только если `submission.enrollment_id → enrollment.group_id` входит в список `group_teachers` этого преподавателя.
- `STUDENT` с `progress.view_own` видит только `progress`, где `enrollment.student_id = current_user.id`.
- `PARENT` видит данные только тех `student_id`, что есть в `parent_student` для него.

Реализация — сервисный слой (не только SQL WHERE), общая функция `assert_can_access_enrollment(user, enrollment_id, action)`, переиспользуется во всех эндпоинтах, работающих с данными ученика.

### 2.3 Rate limiting

- `/auth/login`, `/auth/password-reset/*` — 5 запросов/минуту на IP и отдельно 5/минуту на email (защита от брутфорса и от спама сброса пароля).
- Остальные эндпоинты — 100 запросов/минуту на пользователя (Redis, sliding window).

---

## 3. REST API по ресурсам

Формат ошибок единый для всех эндпоинтов:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "field": "email" } }
```

Коды: `VALIDATION_ERROR` (422), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMITED` (429).

### 3.1 Auth

| Метод | Путь | Доступ |
|---|---|---|
| POST | `/auth/register` | публичный (создаёт user + роль STUDENT, если регистрация с сайта) |
| POST | `/auth/login` | публичный |
| POST | `/auth/refresh` | публичный (с refresh token) |
| POST | `/auth/logout` | авторизован |
| POST | `/auth/logout-all` | авторизован |
| POST | `/auth/password-reset/request` | публичный |
| POST | `/auth/password-reset/confirm` | публичный |
| GET | `/auth/me` | авторизован — профиль + роли + permissions |

### 3.2 Курс / модули / уроки

| Метод | Путь | Доступ |
|---|---|---|
| GET | `/courses`, `/courses/{id}` | публичный (для лендинга) / авторизован (для кабинета) |
| GET | `/courses/{id}/modules` | — |
| POST/PATCH/DELETE | `/courses`, `/modules`, `/lessons` | `lesson.manage_content` (ADMIN) |
| GET | `/enrollments/{id}/lessons` | ученик/преподаватель своей группы — возвращает уроки курса с **персональным** статусом из `enrollment_lesson_status` (join, не глобальный `lessons`) |
| GET | `/lessons/{id}?enrollment_id=` | детальная страница урока: контент + материалы + статус конкретного enrollment + вложенное задание |
| POST | `/enrollments/{id}/lessons/{lesson_id}/complete` | STUDENT (только свой enrollment) — переводит `enrollment_lesson_status.status = completed`, запускает разблокировку следующего урока (раздел 4.2) и пересчёт прогресса |
| POST | `/enrollments/{id}/lessons/{lesson_id}/unlock-early` | `lesson.unlock_early` (TEACHER своей группы / ADMIN), body: `{reason}` — пишет в `lesson_unlock_log`, ставит статус `available` |

### 3.3 Зачисления, группы, преподаватели

| Метод | Путь | Доступ |
|---|---|---|
| POST | `/enrollments` | ADMIN — создаёт enrollment + инициализирует `enrollment_lesson_status` для всех уроков курса (первый — `available`, остальные — `locked`) |
| GET | `/enrollments/{id}` | ADMIN / сам ученик / преподаватель группы |
| PATCH | `/enrollments/{id}` (status) | ADMIN |
| GET/POST/DELETE | `/groups`, `/groups/{id}/teachers` | ADMIN (`group.manage_teachers`) |
| GET | `/groups/{id}/students` | TEACHER этой группы / ADMIN |

### 3.4 Задания и сдачи

| Метод | Путь | Доступ |
|---|---|---|
| GET | `/enrollments/{id}/submissions` | свои — STUDENT; своей группы — TEACHER; фильтр `?status=` |
| POST | `/enrollments/{id}/assignments/{assignment_id}/submissions` | STUDENT (только свой enrollment) — создание новой попытки, см. алгоритм 4.3 |
| GET | `/submissions/{id}` | автор / преподаватель группы / ADMIN — включает все попытки по этому заданию |
| POST | `/submissions/{id}/grade` | `submission.grade` (TEACHER своей группы) — body: `{score, comment, decision: accepted|needs_revision}` |

### 3.5 Расписание и посещаемость

| Метод | Путь | Доступ |
|---|---|---|
| POST | `/class-sessions` | TEACHER своей группы / ADMIN |
| GET | `/class-sessions?group_id=&from=&to=` | участники группы |
| POST | `/class-sessions/{id}/attendance` | TEACHER своей группы — bulk-простановка статусов по всем ученикам сессии |
| POST | `/attendance/{id}/reason` | TEACHER — создание `attendance_reasons`, автоматически считает `deadline_at = marked_at + 7 дней` |
| POST | `/attendance-reasons/{id}/decision` | `attendance.decide` (TEACHER/ADMIN), body: `{decision_type, class_session_id?, adjustment_amount?}` — см. алгоритм 4.4 |
| GET | `/enrollments/{id}/attendance` | ученик/преподаватель/родитель |

### 3.6 Оплата

| Метод | Путь | Доступ |
|---|---|---|
| POST | `/invoices` | ADMIN, либо создаются автоматически cron-джобом 1-го числа месяца для всех активных enrollments |
| GET | `/enrollments/{id}/invoices` | ученик/родитель/ADMIN |
| POST | `/payments` | ADMIN (`payment.record`), body: `{enrollment_id, amount, method, allocations: [{invoice_id, amount}]}` — см. алгоритм 4.5 |

### 3.7 Прогресс

| Метод | Путь | Доступ |
|---|---|---|
| GET | `/enrollments/{id}/progress` | ученик/преподаватель/родитель/ADMIN |
| POST | `/enrollments/{id}/progress/override` | `progress.override`, body: `{value, reason}` — пишет `progress_override` + `progress_override_log` |
| DELETE | `/enrollments/{id}/progress/override` | сброс override, возврат к `progress_calculated` |

### 3.8 Чат (REST-часть, реалтайм — раздел 5)

| Метод | Путь | Доступ |
|---|---|---|
| GET | `/chat-rooms` | список чатов текущего пользователя (по `chat_members`) |
| GET | `/chat-rooms/{id}/messages?before=&limit=` | пагинация по времени |
| POST | `/chat-rooms/{id}/messages/{msg_id}/pin` | `chat.moderate` |
| DELETE | `/chat-rooms/{id}/messages/{msg_id}` | автор в течение 5 минут / `chat.moderate` в любое время |

### 3.9 Уведомления

| Метод | Путь | Доступ |
|---|---|---|
| GET | `/notifications?unread=true` | свои |
| POST | `/notifications/{id}/read` | свои |
| POST | `/notifications/read-all` | свои |

### 3.10 Файлы

| Метод | Путь | Доступ |
|---|---|---|
| POST | `/files` (multipart) | авторизован — загрузка в object storage, создание записи `files`, лимит размера/типа на уровне валидации |
| GET | `/files/{id}` | владелец / тот, у кого есть доступ к сущности, где файл прикреплён (сдача, сообщение, аватар) — временная подписанная ссылка (presigned URL), не прямая раздача |

### 3.11 Админка

| Метод | Путь | Доступ |
|---|---|---|
| GET | `/admin/stats/overview` | `admin.full_access` — агрегаты для KPI-плашек (раздел 6.1) |
| GET | `/admin/stats/students-table` | таблица учеников с реальными нулями для неактивных |
| GET | `/admin/logs/lesson-unlocks`, `/admin/logs/progress-overrides`, `/admin/logs/attendance-decisions` | сводные логи ручных решений |

---

## 4. Бизнес-логика — детальные алгоритмы

### 4.1 Инициализация enrollment

При `POST /enrollments`:
1. Создаётся запись `enrollments`.
2. Для каждого урока курса (`order_index` по возрастанию) создаётся `enrollment_lesson_status`: первый урок курса → `available`, остальные → `locked`.
3. Создаётся `progress` со значением `progress_calculated = 0`.
4. Ученик добавляется в `chat_members` для `chat_room` группы и платформенного «Общего чата».

### 4.2 Прохождение и разблокировка урока

При `POST /enrollments/{id}/lessons/{lesson_id}/complete`:
1. Проверка: `enrollment_lesson_status.status` для этого урока должен быть `available` или `in_progress` (нельзя завершить `locked`).
2. Обновление: `status = completed`, `completed_at = now()`.
3. Находим следующий урок по `order_index` в том же курсе → если он `locked`, переводим в `available`.
4. Запуск пересчёта прогресса (алгоритм 4.6).

По умолчанию завершение урока **не требует** принятой сдачи ДЗ — это отдельное действие ученика. Если бизнес захочет строгий режим (следующий урок открывается только после `accepted` по заданию текущего), это включается флагом `courses.strict_lesson_gate` и проверяется дополнительным условием в пункте 3 — на уровне БД/API уже заложено место для этого флага, чтобы не переделывать схему.

### 4.3 Создание попытки сдачи

При `POST /enrollments/{id}/assignments/{assignment_id}/submissions`:
1. Находим последнюю попытку (`MAX(attempt_number)`) для пары (enrollment, assignment).
2. Если попыток нет → `attempt_number = 1`.
3. Если последняя попытка есть и её статус `needs_revision` → новая попытка `attempt_number = last + 1`.
4. Если последняя попытка в статусе `submitted` или `accepted` → **409 Conflict** («сдача уже на проверке / уже принята, повторная отправка недоступна»).
5. Новая запись создаётся со статусом `submitted`, отправляется notification преподавателям группы.

### 4.4 Проверка ДЗ и обновление прогресса

При `POST /submissions/{id}/grade`:
1. Создаётся `grades` (score, comment, graded_by).
2. `submission.status` = `accepted` или `needs_revision` по переданному `decision`.
3. Notification ученику.
4. Запуск пересчёта прогресса (4.6).

### 4.5 Обработка пропуска и дедлайна решения

При создании `attendance_reasons`: `deadline_at = marked_at + interval '7 days'`.

Фоновый job (ежедневно, раздел 6):
- находит `attendance_reasons` где `decision_type IS NULL` и `deadline_at - interval '1 day' <= now()` и ещё не отправлено напоминание → шлёт notification преподавателю группы;
- находит те, где `deadline_at < now()` и `decision_type IS NULL` → выставляет `attendance.status = absent_unresolved`.

При `POST /attendance-reasons/{id}/decision`:
- если `decision_type = makeup_lesson`: создаётся/привязывается `class_sessions` (новая сессия с `type='makeup'`) → создаётся `makeup_lessons`, `attendance.status = excused_makeup`;
- если `decision_type = payment_adjustment`: создаётся/обновляется `invoices.adjustment_reason_id` с уменьшением `amount` на переданную `adjustment_amount`, `attendance.status = excused_payment_adjustment`.
- Ограничение на уровне БД: `attendance_reasons.decision_type` — не может быть переопределён повторно без явного сброса через ADMIN (защита от «два решения на один пропуск»).

### 4.6 Инвойсы и оплата

- 1-го числа каждого месяца cron создаёт `invoices` для всех enrollments со `status = active` на сумму базовой стоимости, `due_date` = настраиваемое число месяца.
- При `POST /payments`: создаётся `payments`, затем для каждого элемента `allocations` — `payment_allocations`.
- Пересчёт статуса инвойса: `paid_sum = SUM(payment_allocations.amount WHERE invoice_id = X)`; если `paid_sum >= invoices.amount` → `status = paid`; иначе если `now() > due_date` → `overdue`; иначе `pending`.
- Ежедневный cron дополнительно переводит все `pending` с истёкшим `due_date` в `overdue` (на случай, если по инвойсу вообще не было платежей).

### 4.7 Расчёт прогресса (единая формула, исправленная версия)

Запускается сервисом `recalculate_progress(enrollment_id)` после: завершения урока (4.2), выставления оценки (4.4), ручного override.

```
total_lessons = 50
completed_lessons = COUNT(enrollment_lesson_status WHERE status='completed')

-- финальный проект (assignment.is_final_project = true) исключается из этого блока
regular_assignments_total = COUNT(assignments WHERE is_final_project = false)   -- 49
accepted_regular = COUNT(submissions WHERE status='accepted' AND assignment.is_final_project=false, последняя попытка по каждому assignment)
avg_grade_regular = AVG(grades.score WHERE submission принадлежит принятым regular submissions)

final_submission = последняя попытка по assignment WHERE is_final_project=true
final_project_status =
    0    если final_submission отсутствует
    0.5  если final_submission.status IN ('submitted','needs_revision')
    1    если final_submission.status = 'accepted'

progress_calculated =
    40 * (completed_lessons / total_lessons)
  + 40 * (accepted_regular / regular_assignments_total) * (avg_grade_regular / 100)
  + 20 * final_project_status
```

Результат округляется до 2 знаков, пишется в `progress.progress_calculated`, `updated_at = now()`. Если `progress.progress_override IS NOT NULL` — во всех выдачах API (`GET /enrollments/{id}/progress`) возвращается `override`, но `calculated` пересчитывается и хранится всегда, чтобы при сбросе override не терять актуальное расчётное значение.

---

## 5. WebSocket-протокол (чат и live-уведомления)

Подключение: `wss://api.eduflow.app/ws?token=<access_token>`. Токен проверяется как обычный JWT при апгрейде соединения; при истечении — сервер шлёт `{"type":"auth_expired"}` и закрывает соединение, клиент обязан переподключиться после `/auth/refresh`.

Формат сообщений — везде `{"type": "...", "payload": {...}}`.

**Клиент → сервер:**
```
{"type":"chat.send",    "payload":{"chat_room_id":1,"text":"...","reply_to_id":null,"file_ids":[]}}
{"type":"chat.typing",  "payload":{"chat_room_id":1}}
{"type":"chat.join",    "payload":{"chat_room_id":1}}   -- подписка на комнату после открытия экрана чата
```

**Сервер → клиент:**
```
{"type":"chat.message.new",     "payload":{...полная запись message...}}
{"type":"chat.message.pinned",  "payload":{"message_id":..,"pinned":true}}
{"type":"chat.message.deleted", "payload":{"message_id":..}}
{"type":"chat.typing",          "payload":{"chat_room_id":..,"user_id":..}}
{"type":"notification.new",     "payload":{...запись notifications...}}
```

Рассылка `chat.message.new` — только участникам `chat_members` данной комнаты (сервер хранит map `chat_room_id → set(connection)` в памяти/Redis pub-sub при горизонтальном масштабировании).

---

## 6. Фоновые задачи (cron / очередь)

| Задача | Расписание | Действие |
|---|---|---|
| `check_attendance_deadlines` | ежедневно, 03:00 | напоминание за 1 день до `deadline_at`; перевод в `absent_unresolved` после дедлайна (4.5) |
| `generate_monthly_invoices` | 1-е число месяца, 00:05 | создание `invoices` для активных enrollments (4.6) |
| `mark_overdue_invoices` | ежедневно, 03:10 | перевод `pending` → `overdue` по истёкшему `due_date` |
| `mark_overdue_submissions` | ежедневно, 03:20 | если по заданию истёк срок (`due_offset_sessions` относительно расписания группы) и сдачи нет — соответствующий виртуальный статус `overdue` в выдаче (по сдачам без записи — вычисляется на лету, отдельная запись не создаётся, чтобы не плодить пустые submissions) |
| `notification_dispatch` | очередь (Redis), обработка в реальном времени | доставка `notifications` в WebSocket и, в будущем, email/Telegram |
| `session_cleanup` | еженедельно | удаление `sessions` с истёкшим `expires_at` старше 90 дней (архивные, не нужны для аудита) |

---

## 7. Валидация и лимиты (по мелочам, которые ломают прод, если не зафиксировать)

- `grades.score` — целое 0–100, дробные не принимаются.
- `submissions.github_url` / `project_url` — валидация формата URL (regex + max length 2048), не проверяется доступность ссылки синхронно (чтобы не блокировать запрос сетевым вызовом) — фоновая проверка опциональна на будущее.
- Загрузка файлов (`POST /files`): максимум 25 МБ на файл, разрешённые MIME-типы — конфигурируемый список (изображения, pdf, zip, код), проверка реального content-type по сигнатуре файла, а не по расширению.
- Сообщения в чате: максимум 5000 символов текста, максимум 10 файлов на сообщение.
- Пагинация везде через `limit`/`cursor` (не `offset` для больших таблиц типа `messages`, `notifications`, `submissions` — offset-пагинация деградирует на больших смещениях).
- Идемпотентность `POST /payments`: обязательный заголовок `Idempotency-Key`, чтобы двойной клик/ретрай сети не создал платёж дважды.

---

## 8. Безопасность

- Пароли — `argon2id`, не bcrypt (устойчивее к GPU-перебору при сопоставимой стоимости).
- JWT подписывается asymmetric (RS256), публичный ключ можно раздать другим сервисам для верификации без доступа к приватному ключу.
- Все эндпоинты — только HTTPS, `Strict-Transport-Security` заголовок.
- CORS — белый список доменов (сайт, кабинет, админка), не `*`.
- SQL — только через ORM/параметризованные запросы, без строковой конкатенации.
- Presigned URL для файлов — TTL 5 минут, привязан к конкретному `file_id`, не даёт доступа к чужим файлам по угадыванию ID (плюс проверка прав на уровне 3.10).
- Резервное копирование PostgreSQL — ежедневный snapshot + WAL-архивирование для point-in-time recovery.

---

## 9. Ключевые индексы для производительности (сводно)

`enrollment_lesson_status(enrollment_id, lesson_id)`, `submissions(enrollment_id, assignment_id)`, `attendance(enrollment_id)`, `attendance_reasons(deadline_at)` — для cron, `class_sessions(group_id, date)` — для календаря, `messages(chat_room_id, created_at)` — для пагинации ленты, `invoices(enrollment_id, status)`, `notifications(user_id, read_at)`.

---

## 10. Что осталось на усмотрение реализации (сознательно не фиксируется жёстко)

- Точный список MIME-типов для загрузки файлов — зависит от требований по безопасности на проде.
- TTL access/refresh токенов (15 мин / 30 дней) — дефолт, можно менять конфигом без изменения схемы.
- `strict_lesson_gate` (жёсткая привязка разблокировки урока к принятому ДЗ) — заложено место в схеме (`courses` можно расширить полем), но по умолчанию выключено согласно исходному ТЗ.
