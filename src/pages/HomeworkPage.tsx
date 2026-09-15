import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Upload, Download, Eye, FileText, Clock, AlertCircle, CheckCircle, XCircle, Loader2, MoreVertical } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Dropdown, DropdownItem, DropdownSeparator } from '../components/ui/Dropdown';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { assignments, lessons, statusLabels } from '../data';
import { cn } from '../utils/cn';

export function HomeworkPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'lesson' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAssignment, setSelectedAssignment] = useState<typeof assignments[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'submissions'>('list');
  
  const filteredAssignments = assignments
    .filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const getVal = (item: typeof a) => {
        if (sortBy === 'lesson') return item.lessonId;
        return item[sortBy as keyof typeof item] ?? '';
      };
      let valA: string | number = getVal(a);
      let valB: string | number = getVal(b);
      if (sortBy === 'dueDate') {
        valA = new Date(valA as string).getTime();
        valB = new Date(valB as string).getTime();
      }
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  
  const getStatusBadge = (status: string) => {
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
        {status === 'not_submitted' && <FileText className="h-3 w-3" />}
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };
  
  const handleViewAssignment = (assignment: typeof assignments[0]) => {
    setSelectedAssignment(assignment);
    setModalOpen(true);
    setActiveTab('submissions');
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Домашние задания</h1>
          <p className="text-text-secondary">Сдавайте работы, следите за дедлайнами и просматривайте ревью</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Upload className="h-4 w-4" />
          Сдать работу
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
                placeholder="Поиск по названию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-small border border-border bg-surface text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'not_submitted' | 'submitted' | 'needs_revision' | 'accepted' | 'overdue')}
              className="w-full sm:w-40"
            >
              <option value="all">Все статусы</option>
              <option value="not_submitted">Не сдано</option>
              <option value="submitted">На проверке</option>
              <option value="needs_revision">Требует правок</option>
              <option value="accepted">Принято</option>
              <option value="overdue">Просрочено</option>
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'lesson' | 'status')}
              className="w-full sm:w-40"
            >
              <option value="dueDate">По дедлайну</option>
              <option value="lesson">По уроку</option>
              <option value="status">По статусу</option>
            </Select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="gap-1"
            >
              {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Всего заданий" value={assignments.length} icon={FileText} />
        <StatCard title="Сдано" value={assignments.filter(a => a.status === 'submitted' || a.status === 'accepted' || a.status === 'needs_revision').length} icon={Upload} color="warning" />
        <StatCard title="Принято" value={assignments.filter(a => a.status === 'accepted').length} icon={CheckCircle} color="success" />
        <StatCard title="На проверке" value={assignments.filter(a => a.status === 'submitted').length} icon={Clock} color="warning" />
        <StatCard title="Просрочено" value={assignments.filter(a => a.status === 'overdue').length} icon={AlertCircle} color="error" />
      </div>
      
      {/* Table */}
      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Урок</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Дедлайн</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Оценка</TableHead>
                  <TableHead className="text-right">Попытки</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => {
                  const lesson = lessons.find(l => l.id === assignment.lessonId);
                  return (
                    <TableRow key={assignment.id} className="cursor-pointer hover:bg-primary/5" onClick={() => handleViewAssignment(assignment)}>
                      <TableCell className="font-mono text-text-secondary">#{lesson?.number || assignment.lessonId}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{assignment.title}</TableCell>
                      <TableCell className="text-text-secondary">{formatDate(assignment.dueDate)}</TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {assignment.score !== undefined ? `${assignment.score}%` : '—'}
                      </TableCell>
                      <TableCell className="text-right text-text-secondary">{assignment.attempts}</TableCell>
                      <TableCell className="text-right">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                          content={
                            <>
                              <DropdownItem onClick={() => handleViewAssignment(assignment)}>
                                <Eye className="h-4 w-4 mr-2" /> Посмотреть
                              </DropdownItem>
                              {assignment.status !== 'accepted' && assignment.status !== 'overdue' && (
                                <DropdownItem>
                                  <Upload className="h-4 w-4 mr-2" /> Сдать заново
                                </DropdownItem>
                              )}
                              {assignment.score !== undefined && (
                                <DropdownItem>
                                  <Download className="h-4 w-4 mr-2" /> Скачать решение
                                </DropdownItem>
                              )}
                              <DropdownSeparator />
                              <DropdownItem>
                                <FileText className="h-4 w-4 mr-2" /> Материалы
                              </DropdownItem>
                            </>
                          }
                          align="end"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Assignment Detail Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedAssignment?.title}
        size="xl"
      >
        {selectedAssignment && (
          <AssignmentDetail 
            assignment={selectedAssignment} 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onClose={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color = 'primary' }: { title: string; value: number; icon: React.ComponentType<{ className?: string }>; color?: 'primary' | 'success' | 'warning' | 'error' }) {
  const colors: Record<'primary' | 'success' | 'warning' | 'error', string> = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-error bg-error/10',
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text mt-1">{value}</p>
          </div>
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignmentDetail({ assignment, activeTab, setActiveTab, onClose }: { 
  assignment: typeof assignments[0];
  activeTab: 'list' | 'submissions';
  setActiveTab: (tab: 'list' | 'submissions') => void;
  onClose: () => void;
}) {
  const lesson = lessons.find(l => l.id === assignment.lessonId);
  const attempts = [
    { number: 1, date: '05.10.2026, 14:30', status: assignment.status, score: assignment.score, files: ['solution.js', 'README.md'] },
    ...(assignment.attempts > 1 ? [{ number: 2, date: '06.10.2026, 10:15', status: 'accepted', score: 92, files: ['solution_v2.js'] }] : []),
  ];
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onChange={(v) => setActiveTab(v as 'list' | 'submissions')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Условие задачи</TabsTrigger>
          <TabsTrigger value="submissions">История сдач ({attempts.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Описание задания</h4>
              <p className="text-text-secondary leading-relaxed">
                Выполните практическое задание по теме урока #{lesson?.number}: «{lesson?.title}».
                Реализуйте все требования, указанные в материалах к уроку.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-bg border border-border">
              <h4 className="font-medium mb-3">Требования</h4>
              <ul className="space-y-2 text-sm text-text-secondary list-disc list-inside">
                <li>Чистый, читаемый код с комментариями</li>
                <li>Обработка ошибок и граничных случаев</li>
                <li>Соответствие код-стайлу проекта</li>
                <li>Наличие тестов (желательно)</li>
                <li>README с инструкцией по запуску</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Дополнительные материалы</h4>
              <div className="flex flex-wrap gap-2">
                {['Презентация.pdf', 'Примеры кода.zip', 'Документация.md'].map((f, i) => (
                  <Button key={i} variant="ghost" size="sm" className="gap-1">
                    <FileText className="h-3 w-3" />
                    {f}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Дедлайн: {formatDate(assignment.dueDate)}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Макс. балл: 100
              </span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="submissions">
          <div className="space-y-4">
            {attempts.map((attempt, i) => (
              <Card key={i} className="bg-surface border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={attempt.status === 'accepted' ? 'success' : attempt.status === 'submitted' ? 'warning' : 'error'}>
                      {statusLabels[attempt.status as keyof typeof statusLabels]}
                    </Badge>
                    <span className="text-sm text-text-secondary">Попытка {attempt.number}</span>
                    <span className="text-sm text-text-secondary">{attempt.date}</span>
                  </div>
                  {attempt.score !== undefined && (
                    <span className="text-lg font-bold text-text">{attempt.score}%</span>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {attempt.files.map((f, j) => (
                      <Button key={j} variant="ghost" size="sm" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {f}
                        <Download className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                  
                  {i === 0 && attempt.status === 'needs_revision' && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <h5 className="font-medium text-red-800 mb-2">Комментарий преподавателя:</h5>
                      <p className="text-red-700 text-sm">
                        В функции exampleFunction не обработан случай, когда param === null. 
                        Добавьте проверку и верните ошибку. Также добавьте JSDoc комментарии.
                      </p>
                    </div>
                  )}
                  
                  {i === 1 && attempt.status === 'accepted' && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <h5 className="font-medium text-green-800 mb-2">Комментарий преподавателя:</h5>
                      <p className="text-green-700 text-sm">
                        Отличная работа! Ошибки исправлены, код чистый и хорошо задокументирован. 
                        Тесты проходят. Принято.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {assignment.status !== 'accepted' && assignment.status !== 'overdue' && (
              <Button variant="primary" className="w-full" onClick={onClose}>
                <Upload className="h-4 w-4 mr-1" />
                Отправить новую попытку
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatDate(dateStr: string): string {
  // Simple date formatting for display
  return dateStr;
}