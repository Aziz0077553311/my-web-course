import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, Award, Users, BookOpen, TrendingUp, AlertCircle, CheckCircle, XCircle, HelpCircle, Loader2, ExternalLink, Download, Upload, MessageSquare, Bell, MoreVertical } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Avatar } from '../components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Dropdown, DropdownItem, DropdownSeparator } from '../components/ui/Dropdown';
import { modules, lessons, assignments, calendarEvents, initialMessages, students, statusLabels, lessonStatusLabels } from '../data';
import { cn } from '../utils/cn';

export function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'homework' | 'progress' | 'calendar' | 'chat' | 'profile'>('overview');
  
  // Current user data (demo)
  const currentUser = students[0];
  const currentLesson = lessons.find(l => l.status === 'in_progress');
  const nextLesson = lessons.find(l => l.status === 'available');
  const currentAssignment = assignments.find(a => a.status === 'submitted' || a.status === 'needs_revision');
  const upcomingEvents = calendarEvents.slice(0, 3);
  const recentMessages = initialMessages.slice(0, 3);
  
  const getLessonStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'neutral' | 'info'> = {
      completed: 'success',
      in_progress: 'warning',
      available: 'neutral',
      locked: 'neutral',
    };
    return (
      <Badge variant={variants[status] || 'neutral'} className="gap-1">
        {status === 'completed' && <CheckCircle className="h-3 w-3" />}
        {status === 'in_progress' && <Loader2 className="h-3 w-3 animate-spin" />}
        {status === 'locked' && <XCircle className="h-3 w-3" />}
        {status === 'available' && <HelpCircle className="h-3 w-3" />}
        {lessonStatusLabels[status as keyof typeof lessonStatusLabels]}
      </Badge>
    );
  };
  
  const getAssignmentStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'neutral' | 'info'> = {
      accepted: 'success',
      submitted: 'warning',
      needs_revision: 'error',
      overdue: 'error',
      not_submitted: 'neutral',
    };
    return (
      <Badge variant={variants[status] || 'neutral'} className="gap-1">
        {status === 'accepted' && <CheckCircle className="h-3 w-3" />}
        {status === 'submitted' && <Clock className="h-3 w-3" />}
        {status === 'needs_revision' && <AlertCircle className="h-3 w-3" />}
        {status === 'overdue' && <XCircle className="h-3 w-3" />}
        {status === 'not_submitted' && <HelpCircle className="h-3 w-3" />}
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Привет, {currentUser.name.split(' ')[0]}!</h1>
          <p className="text-text-secondary">Продолжайте обучение с того места, где остановились</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Bell className="h-4 w-4" />
            Уведомления
          </Button>
<Button variant="primary" size="sm" onClick={() => navigate('/lesson/29')}>
              <ChevronRight className="h-4 w-4 mr-1" />
              Продолжить урок
            </Button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Пройдено уроков" 
          value={`${currentUser.lessonsCompleted}/50`} 
          icon={BookOpen} 
          trend="+3 за неделю"
          trendPositive
        />
        <KPICard 
          title="Общий прогресс" 
          value={`${currentUser.progress}%`} 
          icon={TrendingUp} 
          progress={currentUser.progress}
        />
        <KPICard 
          title="Средняя оценка" 
          value={currentUser.averageScore} 
          icon={Award} 
          trend="+2% за месяц"
          trendPositive
        />
        <KPICard 
          title="Посещаемость" 
          value={`${currentUser.attendance}%`} 
          icon={Users} 
          trend="Отлично"
          trendPositive
        />
      </div>
      
      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Main actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue learning */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Продолжить обучение</CardTitle>
                <CardDescription>Ваш текущий урок и следующий в очереди</CardDescription>
              </div>
              <Badge variant="warning">В процессе</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentLesson && (
                <Link to={`/lesson/${currentLesson.id}`} className="block">
                  <div className="flex items-center gap-4 p-4 rounded-small bg-bg hover:bg-border/50 transition-colors group">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-text-secondary">Урок {currentLesson.number}</span>
                        <span className="text-xs text-text-secondary text-border px-2 py-0.5 rounded">{currentLesson.block}</span>
                      </div>
                      <h3 className="font-medium text-text group-hover:text-primary transition-colors truncate">{currentLesson.title}</h3>
                      <p className="text-sm text-text-secondary truncate">{currentLesson.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-text-secondary group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              )}
              
              {nextLesson && (
                <Link to={`/lesson/${nextLesson.id}`} className="block opacity-60 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-4 p-4 rounded-small border border-border">
                    <div className="w-12 h-12 rounded-lg bg-border flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-text-secondary">Урок {nextLesson.number}</span>
                        <span className="text-xs text-text-secondary text-border px-2 py-0.5 rounded">{nextLesson.block}</span>
                      </div>
                      <h3 className="font-medium text-text truncate">{nextLesson.title}</h3>
                      <p className="text-sm text-text-secondary">Станет доступен после завершения текущего урока</p>
                    </div>
                    <XCircle className="h-5 w-5 text-text-secondary" />
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>
          
          {/* Current homework */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Текущее домашнее задание</CardTitle>
                <CardDescription>Дедлайн: 08.10.2026, 23:59</CardDescription>
              </div>
              {currentAssignment && getAssignmentStatusBadge(currentAssignment.status)}
            </CardHeader>
            <CardContent>
              {currentAssignment && (
                <div className="space-y-4">
                  <div className="p-4 rounded-small bg-bg">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="font-medium text-text">{currentAssignment.title}</h4>
                        <p className="text-sm text-text-secondary">Урок {currentAssignment.lessonId} • Попытка {currentAssignment.attempts}</p>
                      </div>
                      {currentAssignment.score !== undefined && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-text">{currentAssignment.score}%</p>
                          <p className="text-xs text-text-secondary">Оценка</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={currentAssignment.attempts === 1 ? 50 : 80} showLabel />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => navigate('/homework')}>Подробнее</Button>
                    <Button variant="primary" onClick={() => navigate(`/lesson/${currentAssignment.lessonId}`)}>
                      <Upload className="h-4 w-4 mr-1" />
                      Отправить решение
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Upcoming lessons (tabs by module) */}
          <Card>
            <CardHeader>
              <CardTitle>Программа курса</CardTitle>
              <CardDescription>Отслеживайте прогресс по модулям</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="1" onChange={(v) => setActiveTab(v as 'overview' | 'lessons' | 'homework' | 'progress' | 'calendar' | 'chat' | 'profile')}>
                <TabsList className="grid w-full grid-cols-7 mb-4">
                  {modules.map((module) => (
                    <TabsTrigger key={module.id} value={String(module.id)} className="text-xs py-2">
                      {module.title.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {modules.map((module) => (
                  <TabsContent key={module.id} value={String(module.id)}>
                    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                      {lessons
                        .filter(l => l.block === module.title)
                        .map((lesson) => (
                          <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="block">
                            <div className={cn(
                              'flex items-center gap-3 p-3 rounded-small transition-colors',
                              lesson.status === 'completed' ? 'bg-green-50' : 
                              lesson.status === 'in_progress' ? 'bg-yellow-50' :
                              lesson.status === 'available' ? 'bg-blue-50' : 'bg-gray-50'
                            )}>
                              <span className="w-8 text-center text-sm font-medium text-text-secondary">{lesson.number}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-text truncate">{lesson.title}</p>
                                <p className="text-xs text-text-secondary">{lesson.duration}</p>
                              </div>
                              {getLessonStatusBadge(lesson.status)}
                            </div>
                          </Link>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Sidebar widgets */}
        <div className="space-y-6">
          {/* Next lesson */}
          <Card>
            <CardHeader>
              <CardTitle>Ближайшее занятие</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents[0] && (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-small bg-bg">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        event.type === 'lesson' && 'bg-blue-100 text-blue-600',
                        event.type === 'call' && 'bg-purple-100 text-purple-600',
                        event.type === 'deadline' && 'bg-red-100 text-red-600',
                        event.type === 'makeup' && 'bg-green-100 text-green-600',
                        event.type === 'other' && 'bg-gray-100 text-gray-600'
                      )}>
                        {event.type === 'lesson' && <BookOpen className="h-5 w-5" />}
                        {event.type === 'call' && <MessageSquare className="h-5 w-5" />}
                        {event.type === 'deadline' && <AlertCircle className="h-5 w-5" />}
                        {event.type === 'makeup' && <CheckCircle className="h-5 w-5" />}
                        {event.type === 'other' && <Users className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text">{event.title}</p>
                        <p className="text-sm text-text-secondary">{event.day} число, {event.time}</p>
                        {event.group && <p className="text-xs text-text-secondary">{event.group}</p>}
                        {event.teacher && <p className="text-xs text-text-secondary">{event.teacher}</p>}
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/calendar')}>Полный календарь</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Chat preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Чат группы</CardTitle>
              <Badge variant="info">3 новых</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <Avatar fallback={msg.author.split(' ').map(n => n[0]).join('').slice(0,2)} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-text">{msg.author}</span>
                        <Badge variant={msg.role === 'teacher' ? 'info' : 'neutral'} className="text-xs">{msg.role === 'teacher' ? 'Преподаватель' : 'Ученик'}</Badge>
                        {msg.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-text-secondary truncate">{msg.text}</p>
                    </div>
                    <span className="text-xs text-text-secondary">{msg.time}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate('/chat')}>Открыть чат</Button>
            </CardContent>
          </Card>
          
          {/* Quick stats */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрая статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StatRow label="Сдано ДЗ" value="28/50" progress={56} />
                <StatRow label="Принято с первой" value="24/28" progress={86} />
                <StatRow label="На проверке" value="3" progress={0} />
                <StatRow label="Требуют правок" value="1" progress={0} />
                <StatRow label="Просрочено" value="1" progress={0} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, trend, trendPositive, progress }: { 
  title: string; 
  value: string; 
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendPositive?: boolean;
  progress?: number;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text mt-1">{value}</p>
            {progress !== undefined && (
              <Progress value={progress} className="mt-3" />
            )}
            {trend && (
              <p className={cn('text-xs mt-2 flex items-center gap-1', trendPositive ? 'text-success' : 'text-error')}>
                {trendPositive && <TrendingUp className="h-3 w-3" />}
                {!trendPositive && <TrendingUp className="h-3 w-3" />}
                {trend}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-text">{value}</span>
      </div>
      {progress > 0 && <Progress value={progress} className="h-1.5" />}
    </div>
  );
}