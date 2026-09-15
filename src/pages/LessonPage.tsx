import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Check, Clock, X, Loader2, BookOpen, Code, FileText, Video, ChevronDown, ChevronUp, Download, MessageSquare, Star, Flag, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';
import { modules, lessons, lessonStatusLabels } from '../data';
import { cn } from '../utils/cn';

export function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lessonId = parseInt(id || '1');
  const lesson = lessons.find(l => l.id === lessonId);
  const currentModule = modules.find(m => {
    const [start, end] = m.lessonRange.split('–').map(Number);
    return lessonId >= start && lessonId <= end;
  });
  
  const moduleLessons = lessons.filter(l => l.block === currentModule?.title);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'theory' | 'code' | 'materials' | 'homework'>('theory');
  const [completed, setCompleted] = useState(lesson?.status === 'completed');
  
  if (!lesson) return null;
  
  const prevLesson = lessons.find(l => l.number === lessonId - 1);
  const nextLesson = lessons.find(l => l.number === lessonId + 1);
  const canGoNext = nextLesson && (lesson.status === 'completed' || completed);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4 text-success" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
      case 'available': return <Clock className="h-4 w-4 text-neutral" />;
      case 'locked': return <X className="h-4 w-4 text-neutral" />;
      default: return <Clock className="h-4 w-4 text-neutral" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#14142B]/95 backdrop-blur border-b border-white/10">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-white/70 hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="text-xl font-bold text-primary">EduFlow</Link>
            <div className="hidden lg:flex items-center gap-2 text-sm text-white/60">
              <span>{currentModule?.title}</span>
              <ChevronRight className="h-4 w-4" />
              <span>Урок {lesson.number}: {lesson.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
              <Star className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
              <Flag className="h-5 w-5" />
            </Button>
            <Avatar fallback="АС" size="sm" />
          </div>
        </div>
      </header>
      
      <div className="pt-14 h-[calc(100vh-3.5rem)] flex overflow-hidden">
        {/* Sidebar - Lesson playlist */}
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#14142B] border-r border-white/10 transition-transform duration-300 overflow-y-auto',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'lg:translate-x-0'
          )}
        >
          <div className="p-4">
            {/* Module progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{currentModule?.title}</h3>
                <span className="text-xs text-white/50">
                  {moduleLessons.filter(l => l.status === 'completed').length}/{moduleLessons.length}
                </span>
              </div>
              <Progress 
                value={moduleLessons.filter(l => l.status === 'completed').length} 
                max={moduleLessons.length} 
                size="sm"
                className="h-1.5"
              />
            </div>
            
            {/* Lesson list */}
            <nav className="space-y-1">
              {moduleLessons.map((l) => (
                <Link
                  key={l.id}
                  to={`/lesson/${l.id}`}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-colors group',
                    l.id === lessonId
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {getStatusIcon(l.status)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium truncate">{l.title}</p>
                    <p className="text-xs text-white/50">{l.duration}</p>
                  </div>
                </Link>
              ))}
            </nav>
            
            {/* Other modules */}
            <div className="mt-6 space-y-4">
              {modules
                .filter(m => m.title !== currentModule?.title)
                .map((module) => {
                  const modLessons = lessons.filter(l => l.block === module.title);
                  const completedCount = modLessons.filter(l => l.status === 'completed').length;
                  return (
                    <div key={module.id} className="rounded-lg border border-white/10 overflow-hidden">
                      <button className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${module.accent}30` }}>
                            <BookOpen className="h-4 w-4" style={{ color: module.accent }} />
                          </div>
                          <div>
                            <p className="font-medium text-white">{module.title}</p>
                            <p className="text-xs text-white/50">{module.lessonRange} уроков</p>
                          </div>
                        </div>
                        <span className="text-xs text-white/50">{completedCount}/{modLessons.length}</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </aside>
        
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 lg:pl-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Lesson header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
                    Урок {lesson.number}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-white/60">
                    {lesson.block}
                  </span>
                  <Badge variant={lesson.status === 'completed' ? 'success' : lesson.status === 'in_progress' ? 'warning' : 'neutral'}>
                    {lessonStatusLabels[lesson.status as keyof typeof lessonStatusLabels]}
                  </Badge>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">{lesson.title}</h1>
                <p className="text-white/60">{lesson.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Материалы
                </Button>
                <Button variant="primary" size="sm" onClick={() => setCompleted(!completed)}>
                  {completed ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Урок пройден
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Завершить урок
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Video player placeholder */}
            <div className="aspect-video rounded-xl bg-[#0A0A15] relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <Play className="h-10 w-10 text-primary ml-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Видеоурок: {lesson.title}</p>
                    <p className="text-sm text-white/60">{lesson.duration} • 1080p</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Content tabs */}
            <Tabs defaultValue="theory" onChange={(v) => setActiveTab(v as 'theory' | 'code' | 'materials' | 'homework')}>
              <TabsList className="grid w-full grid-cols-4 mb-4 bg-[#14142B] rounded-lg p-1">
                <TabsTrigger value="theory" className="bg-transparent">Теория</TabsTrigger>
                <TabsTrigger value="code" className="bg-transparent">Код</TabsTrigger>
                <TabsTrigger value="materials" className="bg-transparent">Материалы</TabsTrigger>
                <TabsTrigger value="homework" className="bg-transparent">ДЗ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="theory">
                <div className="prose prose-invert max-w-none space-y-6">
                  <h2 className="text-xl font-bold">Введение</h2>
                  <p className="text-white/70 leading-relaxed">
                    {lesson.description} В этом уроке мы подробно разберем все ключевые концепции, 
                    покажем практические примеры и дадим задания для закрепления материала.
                  </p>
                  
                  <h2 className="text-xl font-bold">Основные концепции</h2>
                  <ul className="list-disc list-inside space-y-2 text-white/70">
                    <li>Концепция 1: подробное объяснение с примерами из реальной жизни</li>
                    <li>Концепция 2: как это работает под капотом и почему это важно</li>
                    <li>Концепция 3: распространенные ошибки и как их избежать</li>
                    <li>Концепция 4: лучшие практики и паттерны использования</li>
                  </ul>
                  
                  <h2 className="text-xl font-bold">Практический пример</h2>
                  <p className="text-white/70">
                    Рассмотрим конкретный пример реализации. Код доступен во вкладке «Код» 
                    и в материалах к уроку.
                  </p>
                  
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-white/70"><strong>💡 Совет:</strong> Обязательно попробуйте запустить код самостоятельно и поэкспериментируйте с параметрами.</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="code">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">main.js</h3>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Скачать
                    </Button>
                  </div>
                  <pre className="bg-[#0A0A15] rounded-lg p-4 overflow-x-auto text-sm"><code>{`// Пример кода для урока "${lesson.title}"

function exampleFunction(param) {
  // TODO: Реализуйте логику здесь
  console.log('Урок:', '${lesson.title}');
  return param * 2;
}

// Тестирование
const result = exampleFunction(5);
console.log('Результат:', result); // 10

// Дополнительные примеры в материалах к уроку`}</code></pre>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-[#14142B] border-white/10">
                      <CardHeader>
                        <CardTitle className="text-base">Пример 1</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-[#0A0A15] rounded p-3 text-xs overflow-x-auto"><code>{`// Дополнительный пример
const data = [1, 2, 3, 4, 5];
const doubled = data.map(x => x * 2);
console.log(doubled);`}</code></pre>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#14142B] border-white/10">
                      <CardHeader>
                        <CardTitle className="text-base">Пример 2</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-[#0A0A15] rounded p-3 text-xs overflow-x-auto"><code>{`// Еще один пример
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}`}</code></pre>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="materials">
                <div className="space-y-3">
                  {[
                    { name: 'Презентация урока.pdf', type: 'pdf', size: '2.4 MB' },
                    { name: 'Шпаргалка по теме.pdf', type: 'pdf', size: '856 KB' },
                    { name: 'Примеры кода.zip', type: 'zip', size: '1.2 MB' },
                    { name: 'Ссылки на документация.md', type: 'md', size: '12 KB' },
                    { name: 'Дополнительное видео.mp4', type: 'video', size: '45 MB' },
                  ].map((file, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[#14142B] border border-white/10 hover:bg-white/5 transition-colors">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        file.type === 'pdf' && 'bg-red-500/20 text-red-400',
                        file.type === 'zip' && 'bg-yellow-500/20 text-yellow-400',
                        file.type === 'md' && 'bg-blue-500/20 text-blue-400',
                        file.type === 'video' && 'bg-purple-500/20 text-purple-400'
                      )}>
                        {file.type === 'pdf' && <FileText className="h-5 w-5" />}
                        {file.type === 'zip' && <Code className="h-5 w-5" />}
                        {file.type === 'md' && <FileText className="h-5 w-5" />}
                        {file.type === 'video' && <Video className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-white/50">{file.size}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="homework">
                <div className="space-y-4">
                  <Card className="bg-[#14142B] border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Домашнее задание</CardTitle>
                        <Badge variant="warning">На проверке</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Задание</h4>
                        <p className="text-white/70 mb-4">
                          Реализуйте практическое задание по теме урока. 
                          Требования: чистый код, комментарии, обработка ошибок.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                          <span>Дедлайн: 08.10.2026, 23:59</span>
                          <span>Макс. балл: 100</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        <h4 className="font-medium mb-3">Ваша сдача</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-yellow-400" />
                              </div>
                              <div>
                                <p className="font-medium">Попытка 1</p>
                                <p className="text-xs text-white/50">Отправлено 05.10.2026, 14:30</p>
                              </div>
                            </div>
                            <Badge variant="warning">На проверке</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="primary" className="w-full" onClick={() => navigate('/homework')}>
                        <Upload className="h-4 w-4 mr-1" />
                        Отправить новую попытку
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <Button variant="secondary" disabled={!prevLesson} onClick={() => prevLesson && navigate(`/lesson/${prevLesson.id}`)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Предыдущий урок
              </Button>
              <div className="flex-1 text-center">
                <Progress value={lessonId} max={50} showLabel className="w-64 mx-auto" />
              </div>
              <Button variant="primary" disabled={!canGoNext} onClick={() => canGoNext && nextLesson && navigate(`/lesson/${nextLesson.id}`)}>
                Следующий урок
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}