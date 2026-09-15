import React, { useState } from 'react';
import { LayoutDashboard, Users, UserPlus, BookOpen, Calendar, ClipboardCheck, TrendingUp, CreditCard, MessageSquare, Settings, Activity, BarChart2, DollarSign, CheckCircle, AlertCircle, XCircle, Clock, MoreVertical, Search, Filter, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Avatar } from '../components/ui/Avatar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Dropdown, DropdownItem, DropdownSeparator } from '../components/ui/Dropdown';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { students, modules, lessons, assignments, calendarEvents, type Student } from '../data';
import { cn } from '../utils/cn';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'teachers' | 'groups' | 'courses' | 'lessons' | 'homework' | 'calendar' | 'attendance' | 'grades' | 'payments' | 'chats' | 'users' | 'settings' | 'logs'>('dashboard');
  const [search, setSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const tabs = [
    { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
    { id: 'students', label: 'Ученики', icon: Users },
    { id: 'teachers', label: 'Преподаватели', icon: UserPlus },
    { id: 'groups', label: 'Группы', icon: Users },
    { id: 'courses', label: 'Курсы', icon: BookOpen },
    { id: 'lessons', label: 'Уроки', icon: BookOpen },
    { id: 'homework', label: 'ДЗ', icon: ClipboardCheck },
    { id: 'calendar', label: 'Календарь', icon: Calendar },
    { id: 'attendance', label: 'Посещаемость', icon: CheckCircle },
    { id: 'grades', label: 'Оценки', icon: TrendingUp },
    { id: 'payments', label: 'Платежи', icon: CreditCard },
    { id: 'chats', label: 'Чаты', icon: MessageSquare },
    { id: 'users', label: 'Пользователи и роли', icon: Settings },
    { id: 'settings', label: 'Настройки', icon: Settings },
    { id: 'logs', label: 'Логи', icon: Activity },
  ];
  
  const filteredStudents = students.filter(s => {
    if (studentFilter === 'active' && s.lessonsCompleted === 0) return false;
    if (studentFilter === 'inactive' && s.lessonsCompleted > 0) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  
  const getPaymentBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
      paid: 'success',
      pending: 'warning',
      overdue: 'error',
    };
    return <Badge variant={variants[status] || 'neutral'}>{status === 'paid' ? 'Оплачено' : status === 'pending' ? 'К оплате' : 'Просрочено'}</Badge>;
  };
  
  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden bg-bg">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex flex-col border-r border-white/10 lg:static">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <span className="text-xl font-bold text-primary">EduFlow Admin</span>
        </div>
        
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-small text-sm font-medium transition-colors text-left',
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar fallback="АД" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Администратор</p>
              <p className="text-xs text-white/50 truncate">Полный доступ</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'students' && (
          <StudentsTab
            studentsList={filteredStudents}
            search={search}
            setSearch={setSearch}
            studentFilter={studentFilter}
            setStudentFilter={setStudentFilter}
            onViewStudent={setSelectedStudent}
            setModalOpen={setModalOpen}
          />
        )}
        {activeTab === 'teachers' && <PlaceholderTab title="Преподаватели" icon={UserPlus} />}
        {activeTab === 'groups' && <PlaceholderTab title="Группы" icon={Users} />}
        {activeTab === 'courses' && <PlaceholderTab title="Курсы" icon={BookOpen} />}
        {activeTab === 'lessons' && <PlaceholderTab title="Уроки" icon={BookOpen} />}
        {activeTab === 'homework' && <PlaceholderTab title="Домашние задания" icon={ClipboardCheck} />}
        {activeTab === 'calendar' && <PlaceholderTab title="Календарь" icon={Calendar} />}
        {activeTab === 'attendance' && <PlaceholderTab title="Посещаемость" icon={CheckCircle} />}
        {activeTab === 'grades' && <PlaceholderTab title="Оценки" icon={TrendingUp} />}
        {activeTab === 'payments' && <PlaceholderTab title="Платежи" icon={CreditCard} />}
        {activeTab === 'chats' && <PlaceholderTab title="Чаты" icon={MessageSquare} />}
        {activeTab === 'users' && <PlaceholderTab title="Пользователи и роли" icon={Settings} />}
        {activeTab === 'settings' && <PlaceholderTab title="Настройки" icon={Settings} />}
        {activeTab === 'logs' && <PlaceholderTab title="Логи ручных решений" icon={Activity} />}
      </main>
      
      {/* Student Detail Modal */}
      <Modal
        open={modalOpen && !!selectedStudent}
        onClose={() => { setModalOpen(false); setSelectedStudent(null); }}
        title={selectedStudent?.name}
        size="xl"
      >
        {selectedStudent && <StudentDetailModal student={selectedStudent} onClose={() => { setModalOpen(false); setSelectedStudent(null); }} />}
      </Modal>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Админ-панель</h1>
        <p className="text-text-secondary">Обзор ключевых метрик платформы</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Всего учеников" value={students.length} icon={Users} trend="+5 за месяц" trendPositive />
        <KPICard title="Активных учеников" value={students.filter(s => s.lessonsCompleted > 0).length} icon={Activity} trend="+3 за неделю" trendPositive />
        <KPICard title="Средняя посещаемость" value={`${Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length)}%`} icon={CheckCircle} />
        <KPICard title="Оплаченных инвойсов" value={`${Math.round(students.filter(s => s.payment === 'paid').length / students.length * 100)}%`} icon={DollarSign} trend="+2% за месяц" trendPositive />
      </div>
      
      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Динамика зачислений</CardTitle>
            <CardTitle className="text-base font-normal text-text-secondary">По месяцам</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentChart height={300} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Распределение по блокам</CardTitle>
            <CardTitle className="text-base font-normal text-text-secondary">На каком блоке находится каждая группа</CardTitle>
          </CardHeader>
          <CardContent>
            <BlockDistributionChart height={300} />
          </CardContent>
        </Card>
      </div>
      
      {/* Recent activity table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Таблица активности учеников</CardTitle>
            <CardDescription>Честная статистика с учётом нулей неактивных учеников</CardDescription>
          </div>
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Экспорт CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ученик</TableHead>
                  <TableHead>Группа</TableHead>
                  <TableHead>Пройдено уроков</TableHead>
                  <TableHead className="text-right">Средняя оценка</TableHead>
                  <TableHead className="text-right">Посещаемость</TableHead>
                  <TableHead>Статус оплаты</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar fallback={student.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)} size="sm" />
                        <div>
                          <p className="font-medium text-text">{student.name}</p>
                          {student.lessonsCompleted === 0 && (
                            <Badge variant="neutral" className="mt-1">Не начал</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">{student.group}</TableCell>
                    <TableCell className="font-mono">{student.lessonsCompleted}/50</TableCell>
                    <TableCell className="text-right font-medium">{student.averageScore}</TableCell>
                    <TableCell className="text-right">{student.attendance}%</TableCell>
                    <TableCell>{getPaymentBadge(student.payment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentsTab({ studentsList, search, setSearch, studentFilter, setStudentFilter, onViewStudent, setModalOpen }: {
  studentsList: Student[];
  search: string;
  setSearch: (s: string) => void;
  studentFilter: 'all' | 'active' | 'inactive';
  setStudentFilter: (f: 'all' | 'active' | 'inactive') => void;
  onViewStudent: (s: Student) => void;
  setModalOpen: (open: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Ученики</h1>
          <p className="text-text-secondary">Управление зачислениями, прогрессом и оплатой</p>
        </div>
        <Button variant="primary" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Добавить ученика
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="search"
                placeholder="Поиск по имени..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-small border border-border bg-surface text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Select value={studentFilter} onChange={(e) => setStudentFilter(e.target.value as 'all' | 'active' | 'inactive')} className="w-full sm:w-48">
              <option value="all">Все</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные (0 уроков)</option>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Students table */}
      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ученик</TableHead>
                  <TableHead>Группа</TableHead>
                  <TableHead>Пройдено уроков</TableHead>
                  <TableHead className="text-right">Прогресс</TableHead>
                  <TableHead className="text-right">Средняя оценка</TableHead>
                  <TableHead className="text-right">Посещаемость</TableHead>
                  <TableHead>Статус оплаты</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsList.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar fallback={student.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)} size="sm" />
                        <div>
                          <p className="font-medium text-text">{student.name}</p>
                          {student.lessonsCompleted === 0 && (
                            <Badge variant="neutral" className="mt-1 text-xs">Не начал</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">{student.group}</TableCell>
                    <TableCell className="font-mono">{student.lessonsCompleted}/50</TableCell>
                    <TableCell className="text-right">
                      <Progress value={student.progress} max={100} className="w-32" />
                    </TableCell>
                    <TableCell className="text-right font-medium">{student.averageScore}</TableCell>
                    <TableCell className="text-right">{student.attendance}%</TableCell>
                    <TableCell>{getPaymentBadge(student.payment)}</TableCell>
                    <TableCell>
                      <Dropdown
                        trigger={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                        content={
                          <>
                            <DropdownItem onClick={() => { onViewStudent(student); setModalOpen(true); }}>
                              Просмотр профиля
                            </DropdownItem>
                            <DropdownItem>История прогресса</DropdownItem>
                            <DropdownItem>Домашние задания</DropdownItem>
                            <DropdownItem>Посещаемость</DropdownItem>
                            <DropdownSeparator />
                            <DropdownItem>Скорректировать прогресс</DropdownItem>
                            <DropdownItem>Открыть урок досрочно</DropdownItem>
                          </>
                        }
                        align="end"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentDetailModal({ student, onClose }: { student: typeof students[0]; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar fallback={student.name.split(' ').map(n => n[0]).join('').slice(0,2)} size="xl" />
        <div>
          <h3 className="text-xl font-bold text-text">{student.name}</h3>
          <p className="text-text-secondary">{student.group}</p>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-4 gap-4">
        <StatBox label="Пройдено уроков" value={`${student.lessonsCompleted}/50`} />
        <StatBox label="Прогресс" value={`${student.progress}%`} />
        <StatBox label="Средняя оценка" value={student.averageScore} />
        <StatBox label="Посещаемость" value={`${student.attendance}%`} />
      </div>
      
      <Tabs defaultValue="progress">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Прогресс</TabsTrigger>
          <TabsTrigger value="grades">Оценки</TabsTrigger>
          <TabsTrigger value="attendance">Посещаемость</TabsTrigger>
          <TabsTrigger value="payments">Платежи</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress">
          <div className="space-y-4 mt-4">
            {modules.map((module) => {
              const modLessons = lessons.filter(l => l.block === module.title);
              const completed = modLessons.filter(l => l.status === 'completed').length;
              return (
                <div key={module.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{module.title}</span>
                    <span>{completed}/{modLessons.length}</span>
                  </div>
                  <Progress value={completed} max={modLessons.length} />
                </div>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="grades">
          <p className="text-text-secondary mt-4">История оценок ученика...</p>
        </TabsContent>
        
        <TabsContent value="attendance">
          <p className="text-text-secondary mt-4">История посещаемости...</p>
        </TabsContent>
        
        <TabsContent value="payments">
          <p className="text-text-secondary mt-4">История платежей...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-text mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function PlaceholderTab({ title, icon: Icon }: { title: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="text-text-secondary">Раздел в разработке</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center">
          <Icon className="h-12 w-12 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">Содержимое раздела «{title}» будет добавлено в следующих итерациях</p>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, trend, trendPositive }: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendPositive?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text mt-1">{value}</p>
            {trend && (
              <p className={cn('text-xs mt-2 flex items-center gap-1', trendPositive ? 'text-success' : 'text-error')}>
                {trendPositive && <TrendingUp className="h-3 w-3" />}
                {trend}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EnrollmentChart({ height }: { height: number }) {
  const data = [
    { month: 'Май', count: 12 },
    { month: 'Июн', count: 18 },
    { month: 'Июл', count: 25 },
    { month: 'Авг', count: 32 },
    { month: 'Сен', count: 28 },
    { month: 'Окт', count: 35 },
  ];
  
  const maxCount = Math.max(...data.map(d => d.count));
  const width = data.length * 80;
  
  return (
    <div className="relative h-full" style={{ height }}>
      <svg viewBox={`0 0 ${width + 40} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Bars */}
        {data.map((d, i) => {
          const x = i * 80 + 40;
          const barHeight = (d.count / maxCount) * (height - 60);
          const y = height - barHeight - 40;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={50}
                height={barHeight}
                rx={4}
                fill="#6C4CF1"
              />
              <text
                x={x + 25}
                y={y - 8}
                textAnchor="middle"
                fontSize="12"
                fill="#14142B"
                fontWeight="600"
              >
                {d.count}
              </text>
              <text
                x={x + 25}
                y={height - 15}
                textAnchor="middle"
                fontSize="11"
                fill="#6B7280"
              >
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BlockDistributionChart({ height }: { height: number }) {
  const data = modules.map((module) => {
    const modLessons = lessons.filter(l => l.block === module.title);
    const completed = modLessons.filter(l => l.status === 'completed').length;
    return { ...module, completed, total: modLessons.length };
  });
  
  const maxTotal = Math.max(...data.map(d => d.total));
  const width = data.length * 80;
  
  return (
    <div className="relative h-full" style={{ height }}>
      <svg viewBox={`0 0 ${width + 40} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {data.map((d, i) => {
          const x = i * 80 + 40;
          const barHeight = (d.total / maxTotal) * (height - 80);
          const completedHeight = (d.completed / d.total) * barHeight;
          const y = height - barHeight - 40;
          const completedY = height - completedHeight - 40;
          
          return (
            <g key={i}>
              {/* Total bar */}
              <rect
                x={x}
                y={y}
                width={50}
                height={barHeight}
                rx={4}
                fill="#E7E7F0"
              />
              {/* Completed bar */}
              <rect
                x={x}
                y={completedY}
                width={50}
                height={completedHeight}
                rx={4}
                fill={d.accent}
              />
              <text
                x={x + 25}
                y={completedY - 8}
                textAnchor="middle"
                fontSize="11"
                fill="#14142B"
                fontWeight="600"
              >
                {d.completed}/{d.total}
              </text>
              <text
                x={x + 25}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#6B7280"
                transform={`rotate(-45, ${x + 25}, ${height - 10})`}
              >
                {d.title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function getPaymentBadge(status: string) {
  const variants: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
    paid: 'success',
    pending: 'warning',
    overdue: 'error',
  };
  return <Badge variant={variants[status] || 'neutral'}>{status === 'paid' ? 'Оплачено' : status === 'pending' ? 'К оплате' : 'Просрочено'}</Badge>;
}