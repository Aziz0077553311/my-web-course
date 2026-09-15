export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type AssignmentStatus = 'not_submitted' | 'submitted' | 'needs_revision' | 'accepted' | 'overdue';
export type AttendanceStatus = 'present' | 'absent' | 'excused_pending' | 'excused_makeup' | 'excused_payment_adjustment' | 'absent_unresolved';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface Lesson {
  id: number;
  number: number;
  title: string;
  block: string;
  duration: string;
  status: LessonStatus;
  description: string;
}

export interface Assignment {
  id: number;
  lessonId: number;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  score?: number;
  attempts: number;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  lessonRange: string;
  accent: string;
}

export interface Student {
  id: number;
  name: string;
  group: string;
  lessonsCompleted: number;
  progress: number;
  averageScore: string;
  attendance: number;
  payment: InvoiceStatus;
}

export interface CalendarEvent {
  id: number;
  title: string;
  day: number;
  time: string;
  type: 'lesson' | 'call' | 'makeup' | 'deadline' | 'other';
  group?: string;
  teacher?: string;
  description: string;
}

export interface ChatMessage {
  id: number;
  author: string;
  role: 'teacher' | 'student' | 'admin';
  text: string;
  time: string;
  unread?: boolean;
}

export const modules: Module[] = [
  { id: 1, title: 'Основы программирования', description: 'Алгоритмы, Git и первые программы', lessonRange: '1–5', accent: '#6C4CF1' },
  { id: 2, title: 'HTML', description: 'Семантика, формы и первый проект', lessonRange: '6–10', accent: '#7C5CFC' },
  { id: 3, title: 'CSS', description: 'Адаптивная вёрстка и анимации', lessonRange: '11–16', accent: '#9B6CF4' },
  { id: 4, title: 'JavaScript', description: 'DOM, асинхронность и API', lessonRange: '17–24', accent: '#B07BEA' },
  { id: 5, title: 'React', description: 'Компоненты, хуки и frontend-проект', lessonRange: '25–32', accent: '#C18BE0' },
  { id: 6, title: 'Python и backend', description: 'FastAPI, PostgreSQL и авторизация', lessonRange: '33–40', accent: '#D09AD8' },
  { id: 7, title: 'Machine Learning', description: 'Данные, модели и финальный проект', lessonRange: '41–50', accent: '#E0A9D0' },
];

const lessonTitles = [
  'Что такое программирование и как работает компьютер',
  'Переменные и типы данных',
  'Условия и операторы',
  'Циклы и массивы',
  'Функции, строки и ошибки',
  'Структура HTML-документа',
  'Ссылки и изображения',
  'Списки и таблицы',
  'Формы, input и button',
  'Semantic HTML и проект',
  'Основы CSS и селекторы',
  'Цвета, шрифты и размеры',
  'Box model: margin, padding, border',
  'Flexbox',
  'Grid и position',
  'Адаптивность и анимации',
  'JavaScript: переменные и типы',
  'Условия и циклы',
  'Функции',
  'Массивы и объекты',
  'DOM и события',
  'Формы и localStorage',
  'Асинхронность и Fetch API',
  'Работа с API и проект',
  'React, JSX и компоненты',
  'Props',
  'State и события',
  'Формы и списки в React',
  'Условный рендеринг',
  'Хуки useState и useEffect',
  'API и React Router',
  'Frontend-проект',
  'Основы Python',
  'Функции и структуры данных',
  'Файлы, модули и исключения',
  'ООП на Python',
  'HTTP, client/server и REST API',
  'FastAPI: роуты и ответы',
  'CRUD, PostgreSQL и SQLAlchemy',
  'Authentication и backend-проект',
  'Что такое AI, ML и DL',
  'NumPy',
  'Pandas',
  'Визуализация и статистика',
  'Регрессия',
  'Классификация',
  'Деревья решений и метрики',
  'Train/test split и переобучение',
  'Введение в нейронные сети',
  'Финальный ML-проект',
];

const lessonStatuses: LessonStatus[] = [
  'completed', 'completed', 'completed', 'completed', 'completed',
  'completed', 'completed', 'completed', 'completed', 'completed',
  'completed', 'completed', 'completed', 'completed', 'completed',
  'completed', 'completed', 'completed', 'completed', 'completed',
  'completed', 'completed', 'completed', 'completed', 'completed',
  'completed', 'completed', 'completed', 'completed', 'completed',
  'completed', 'completed', 'in_progress', 'available', 'available',
  ...Array(14).fill('locked') as LessonStatus[],
];

export const lessons: Lesson[] = lessonTitles.map((title, index) => {
  const number = index + 1;
  const block = modules.find((module) => {
    const [start, end] = module.lessonRange.split('–').map(Number);
    return number >= start && number <= end;
  })?.title ?? 'Machine Learning';
  return {
    id: number,
    number,
    title,
    block,
    duration: number % 2 === 0 ? '45 минут' : '1 час',
    status: lessonStatuses[index],
    description: `Практический урок по теме «${title}». Разберите теорию, выполните примеры кода и закрепите материал в задании.`,
  };
});

export const assignments: Assignment[] = lessons.map((lesson, index) => {
  const number = lesson.number;
  let status: AssignmentStatus = 'not_submitted';
  let score: number | undefined;
  let attempts = 0;
  if (number <= 28) {
    status = 'accepted';
    score = 82 + ((index * 7) % 19);
    attempts = 1;
  } else if (number <= 31) {
    status = 'submitted';
    attempts = 1;
  } else if (number === 32) {
    status = 'needs_revision';
    attempts = 2;
  } else if (number === 33) {
    status = 'submitted';
    attempts = 1;
  } else if (number === 34) {
    status = 'overdue';
    attempts = 1;
  }
  return {
    id: number,
    lessonId: number,
    title: `Практика: ${lesson.title}`,
    dueDate: `1${String((index % 9) + 1).padStart(1, '')}.10.2026`,
    status,
    score,
    attempts,
  };
});

export const students: Student[] = [
  { id: 1, name: 'Алина Смирнова', group: 'Frontend · 09:00', lessonsCompleted: 32, progress: 78, averageScore: '91%', attendance: 94, payment: 'paid' },
  { id: 2, name: 'Марк Орлов', group: 'Frontend · 09:00', lessonsCompleted: 29, progress: 71, averageScore: '86%', attendance: 88, payment: 'pending' },
  { id: 3, name: 'София Ким', group: 'Frontend · 12:00', lessonsCompleted: 35, progress: 84, averageScore: '95%', attendance: 97, payment: 'paid' },
  { id: 4, name: 'Данил Петров', group: 'Frontend · 12:00', lessonsCompleted: 0, progress: 0, averageScore: '—', attendance: 0, payment: 'overdue' },
  { id: 5, name: 'Ева Морозова', group: 'ML · 18:00', lessonsCompleted: 41, progress: 82, averageScore: '93%', attendance: 92, payment: 'paid' },
];

export const calendarEvents: CalendarEvent[] = [
  { id: 1, title: 'JavaScript: DOM и события', day: 3, time: '09:00–10:30', type: 'lesson', group: 'Frontend · 09:00', teacher: 'Иван Соколов', description: 'Практическое занятие по событиям и интерактивным интерфейсам.' },
  { id: 2, title: 'Проверка проектов', day: 5, time: '12:00–13:00', type: 'call', group: 'Frontend · 09:00', teacher: 'Иван Соколов', description: 'Разбор текущих проектов и ответы на вопросы.' },
  { id: 3, title: 'Дедлайн: React Router', day: 8, time: '23:59', type: 'deadline', description: 'Отправьте интерактивное приложение с маршрутизацией.' },
  { id: 4, title: 'Отработка: Flexbox', day: 12, time: '18:00–19:00', type: 'makeup', group: 'Frontend · 12:00', teacher: 'Иван Соколов', description: 'Дополнительное занятие для учеников, пропустивших тему.' },
  { id: 5, title: 'Python: функции', day: 15, time: '18:00–19:30', type: 'lesson', group: 'ML · 18:00', teacher: 'Мария Волкова', description: 'Функции, области видимости и работа со списками.' },
  { id: 6, title: 'Консультация перед проектом', day: 21, time: '19:00–20:00', type: 'call', group: 'ML · 18:00', teacher: 'Мария Волкова', description: 'Обсуждение датасета и метрик финального проекта.' },
  { id: 7, title: 'Дедлайн: Pandas', day: 24, time: '23:59', type: 'deadline', description: 'Загрузите очищенный CSV и анализ данных.' },
  { id: 8, title: 'Клуб практики', day: 27, time: '16:00–17:00', type: 'other', group: 'Frontend · 09:00', teacher: 'Иван Соколов', description: 'Совместное решение задач и обмен опытом.' },
];

export const initialMessages: ChatMessage[] = [
  { id: 1, author: 'Иван Соколов', role: 'teacher', text: 'Ребята, привет! Напоминаю, что дедлайн по React Router — в пятницу.', time: '09:12' },
  { id: 2, author: 'Алина Смирнова', role: 'student', text: 'Принято, спасибо! А можно ссылку на пример роутинга?', time: '09:15', unread: true },
  { id: 3, author: 'Марк Орлов', role: 'student', text: 'Я сегодня доделаю форму и отправлю на проверку.', time: '09:18' },
  { id: 4, author: 'Иван Соколов', role: 'teacher', text: 'Отлично. Не забудьте прикрепить ссылку на GitHub в сдаче.', time: '09:20', unread: true },
];

export const projectCards = [
  { title: 'Travel Planner', meta: 'React · TypeScript', description: 'Планировщик путешествий с маршрутами и сохранением данных.', color: '#EDE9FE' },
  { title: 'Budget Flow', meta: 'Python · FastAPI', description: 'API для учёта расходов и аналитики по категориям.', color: '#E0F2FE' },
  { title: 'Mood Tracker', meta: 'React · ML', description: 'Трекер настроения с простой моделью рекомендаций.', color: '#DCFCE7' },
];

export const faqItems = [
  { question: 'Нужен ли опыт в программировании?', answer: 'Нет. Курс начинается с устройства компьютера, переменных и первых алгоритмов.' },
  { question: 'Сколько времени нужно уделять учёбе?', answer: 'Курс интенсивный: 4 занятия в неделю и практика между ними.' },
  { question: 'Можно ли учиться с телефона?', answer: 'Да. Все основные разделы адаптированы для телефона и планшета.' },
  { question: 'Что входит в стоимость?', answer: 'Занятия, проверка домашних заданий, доступ к материалам, чат группы и поддержка преподавателя.' },
];

export const statusLabels: Record<AssignmentStatus, string> = {
  not_submitted: 'Не сдано',
  submitted: 'На проверке',
  needs_revision: 'Требуется исправление',
  accepted: 'Принято',
  overdue: 'Просрочено',
};

export const lessonStatusLabels: Record<LessonStatus, string> = {
  locked: 'Недоступен',
  available: 'Не начат',
  in_progress: 'В процессе',
  completed: 'Пройден',
};
