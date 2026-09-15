import React from 'react';
import { TrendingUp, Award, BookOpen, Users, Target, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { students, assignments, lessons, modules } from '../data';
import { cn } from '../utils/cn';

export function ProgressPage() {
  const currentUser = students[0];
  const acceptedAssignments = assignments.filter(a => a.status === 'accepted');
  const avgGrade = acceptedAssignments.length > 0
    ? Math.round(acceptedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / acceptedAssignments.length)
    : 0;
  
  // Progress by module
  const moduleProgress = modules.map(module => {
    const modLessons = lessons.filter(l => l.block === module.title);
    const completed = modLessons.filter(l => l.status === 'completed').length;
    const total = modLessons.length;
    return { ...module, completed, total, percent: Math.round((completed / total) * 100) };
  });
  
  // Grade history (mock data)
  const gradeHistory = [
    { date: '01.09', grade: 85 },
    { date: '08.09', grade: 88 },
    { date: '15.09', grade: 90 },
    { date: '22.09', grade: 87 },
    { date: '29.09', grade: 92 },
    { date: '06.10', grade: 91 },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Успеваемость</h1>
        <p className="text-text-secondary">Отслеживайте свой прогресс, оценки и достижения</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Общий прогресс" 
          value={`${currentUser.progress}%`} 
          icon={Target} 
          progress={currentUser.progress}
          description="Цель: 100% к концу курса"
        />
        <KPICard 
          title="Средняя оценка" 
          value={`${avgGrade}%`} 
          icon={Award} 
          trend="+3% к прошлому месяцу"
          trendPositive
        />
        <KPICard 
          title="Пройдено уроков" 
          value={`${currentUser.lessonsCompleted}/50`} 
          icon={BookOpen} 
          progress={Math.round((currentUser.lessonsCompleted / 50) * 100)}
        />
        <KPICard 
          title="Посещаемость" 
          value={`${currentUser.attendance}%`} 
          icon={Users} 
          trend="Отличный результат"
          trendPositive
        />
      </div>
      
      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grade dynamics chart */}
          <Card>
            <CardHeader>
              <CardTitle>Динамика среднего балла</CardTitle>
              <CardDescription>Оценки по принятым заданиям за время обучения</CardDescription>
            </CardHeader>
            <CardContent>
              <GradeChart data={gradeHistory} height={280} />
            </CardContent>
          </Card>
          
          {/* Progress by modules */}
          <Card>
            <CardHeader>
              <CardTitle>Прогресс по модулям</CardTitle>
              <CardDescription>Выполнение уроков внутри каждого блока курса</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {moduleProgress.map((mod) => (
                  <ModuleProgressBar key={mod.id} module={mod} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Grades table */}
          <Card>
            <CardHeader>
              <CardTitle>Таблица оценок</CardTitle>
              <CardDescription>Все принятые задания с оценками</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Курс / Модуль</TableHead>
                      <TableHead>Урок</TableHead>
                      <TableHead className="text-right">Оценка</TableHead>
                      <TableHead className="text-right">Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acceptedAssignments.slice(0, 10).map((assignment, i) => {
                      const lesson = lessons.find(l => l.id === assignment.lessonId);
                      return (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-text">{lesson?.block || 'ML'}</p>
                              <p className="text-xs text-text-secondary">Модуль {modules.findIndex(m => m.title === lesson?.block) + 1}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{assignment.title.replace('Практика: ', '')}</TableCell>
                          <TableCell className="text-right font-bold text-text">{assignment.score}%</TableCell>
                          <TableCell className="text-right text-text-secondary">{formatDate(assignment.dueDate)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Summary */}
        <div className="space-y-6">
          {/* Final project */}
          <Card>
            <CardHeader>
              <CardTitle>Финальный ML-проект</CardTitle>
              <CardDescription>Урок 50 — завершающий проект курса</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <BarChart2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Финальный ML-проект</p>
                    <p className="text-sm text-text-secondary">Урок 50 • Machine Learning</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <ProgressRow label="Тема утверждена" value={100} status="completed" />
                <ProgressRow label="Датасет собран" value={100} status="completed" />
                <ProgressRow label="EDA выполнен" value={100} status="completed" />
                <ProgressRow label="Модель обучена" value={70} status="in_progress" />
                <ProgressRow label="Метрики рассчитаны" value={0} status="pending" />
                <ProgressRow label="Отчет готов" value={0} status="pending" />
              </div>
              
              <Progress value={62} showLabel className="mt-2" />
              <p className="text-sm text-text-secondary">Общая готовность проекта: 62%</p>
            </CardContent>
          </Card>
          
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Достижения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Award, label: 'Первая оценка', earned: true },
                  { icon: BookOpen, label: '10 уроков', earned: true },
                  { icon: Target, label: 'Половина курса', earned: true },
                  { icon: TrendingUp, label: 'Средний балл 90+', earned: true },
                  { icon: Users, label: '100% посещаемость', earned: false },
                  { icon: BarChart2, label: 'ML-проект', earned: false },
                ].map((a, i) => (
                  <div key={i} className={cn(
                    'p-3 rounded-lg text-center transition-colors',
                    a.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200 opacity-60'
                  )}>
                    <a.icon className={cn('h-6 w-6 mx-auto mb-2', a.earned ? 'text-green-600' : 'text-gray-400')} />
                    <p className={cn('text-xs font-medium', a.earned ? 'text-green-800' : 'text-gray-500')}>
                      {a.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Сравнение с группой</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ComparisonRow label="Прогресс" user={78} group={65} />
                <ComparisonRow label="Средняя оценка" user={91} group={78} />
                <ComparisonRow label="Посещаемость" user={94} group={87} />
                <ComparisonRow label="Сдано ДЗ" user={56} group={42} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, progress, trend, trendPositive, description }: { 
  title: string; 
  value: string; 
  icon: React.ComponentType<{ className?: string }>;
  progress?: number;
  trend?: string;
  trendPositive?: boolean;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text mt-1">{value}</p>
            {progress !== undefined && <Progress value={progress} className="mt-3" />}
            {trend && (
              <p className={cn('text-xs mt-2 flex items-center gap-1', trendPositive ? 'text-success' : 'text-error')}>
                {trendPositive && <TrendingUp className="h-3 w-3" />}
                {trend}
              </p>
            )}
            {description && <p className="text-xs text-text-secondary mt-1">{description}</p>}
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleProgressBar({ module }: { module: typeof modules[0] & { completed: number; total: number; percent: number } }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${module.accent}20` }}>
            <BookOpen className="h-4 w-4" style={{ color: module.accent }} />
          </div>
          <span className="font-medium text-text">{module.title}</span>
        </div>
        <span className="text-sm font-medium text-text">{module.percent}%</span>
      </div>
      <Progress value={module.completed} max={module.total} showLabel />
    </div>
  );
}

function ProgressRow({ label, value, status }: { label: string; value: number; status: 'completed' | 'in_progress' | 'pending' }) {
  const colors = {
    completed: 'bg-success',
    in_progress: 'bg-warning',
    pending: 'bg-border',
  };
  
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-2 h-2 rounded-full', colors[status])} />
      <span className="text-sm text-text-secondary w-40 truncate">{label}</span>
      <Progress value={value} max={100} className="flex-1 h-1.5" />
      <span className="text-sm font-medium text-text w-12 text-right">{value}%</span>
    </div>
  );
}

function ComparisonRow({ label, user, group }: { label: string; user: number; group: number }) {
  const max = Math.max(user, group, 100);
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-text">Вы: {user}% • Группа: {group}%</span>
      </div>
      <div className="relative h-4">
        <div className="absolute inset-0 bg-border rounded-full" />
        <div 
          className="absolute top-0 bottom-0 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(user / max) * 100}%` }}
        />
        <div 
          className="absolute top-0 bottom-0 bg-primary/30 rounded-full transition-all duration-500"
          style={{ width: `${(group / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

function GradeChart({ data, height }: { data: { date: string; grade: number }[]; height: number }) {
  const maxGrade = 100;
  const minGrade = Math.min(...data.map(d => d.grade)) - 5;
  const width = data.length * 50;
  
  const points = data.map((d, i) => {
    const x = i * 50 + 25;
    const y = height - ((d.grade - minGrade) / (maxGrade - minGrade)) * (height - 40) - 20;
    return `${x},${y}`;
  }).join(' ');
  
  const areaPoints = [
    `${width + 25},${height - 20}`,
    `${25},${height - 20}`,
    ...points.split(' ').reverse(),
  ].join(' ');
  
  return (
    <div className="relative" style={{ width: '100%', height }}>
      <svg viewBox={`0 0 ${width + 50} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C4CF1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6C4CF1" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[20, 40, 60, 80, 100].map((g) => (
          <line
            key={g}
            x1="25"
            y1={height - ((g - minGrade) / (maxGrade - minGrade)) * (height - 40) - 20}
            x2={width + 25}
            y2={height - ((g - minGrade) / (maxGrade - minGrade)) * (height - 40) - 20}
            stroke="#E7E7F0"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}
        
        {/* Area */}
        <path
          d={`M${areaPoints}Z`}
          fill="url(#gradeGradient)"
        />
        
        {/* Line */}
        <path
          d={`M${points}`}
          stroke="#6C4CF1"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Points */}
        {data.map((d, i) => {
          const x = i * 50 + 25;
          const y = height - ((d.grade - minGrade) / (maxGrade - minGrade)) * (height - 40) - 20;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={5}
                fill="#6C4CF1"
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#14142B"
                fontWeight="600"
              >
                {d.grade}%
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between px-2 -ml-2 -mt-2 text-xs text-text-secondary">
        {data.map((d, i) => (
          <div key={i} style={{ width: 50, textAlign: i === 0 ? 'left' : i === data.length - 1 ? 'right' : 'center' }}>
            {d.date}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return dateStr;
}