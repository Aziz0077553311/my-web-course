import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Users, AlertCircle, CheckCircle, MoreVertical, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dropdown, DropdownItem, DropdownSeparator } from '../components/ui/Dropdown';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { calendarEvents } from '../data';
import { cn } from '../utils/cn';

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9)); // October 2026
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<typeof calendarEvents[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  
  const today = new Date();
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
  
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];
  
  // Previous month days
  for (let i = startDay - 1; i >= 0; i--) {
    week.unshift(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -i));
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    week.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  }
  
  // Next month days
  const nextMonthDaysNeeded = 7 - week.length;
  for (let day = 1; day <= nextMonthDaysNeeded; day++) {
    week.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day));
  }
  if (week.length > 0) weeks.push(week);
  
  const getEventsForDay = (date: Date) => {
    return calendarEvents.filter(e => e.day === date.getDate());
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };
  
  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      lesson: 'bg-blue-500',
      call: 'bg-purple-500',
      deadline: 'bg-red-500',
      makeup: 'bg-green-500',
      other: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-500';
  };
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <Calendar className="h-3 w-3" />;
      case 'call': return <Users className="h-3 w-3" />;
      case 'deadline': return <AlertCircle className="h-3 w-3" />;
      case 'makeup': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };
  
  const handleEventClick = (event: typeof calendarEvents[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setModalOpen(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Календарь</h1>
          <p className="text-text-secondary">Занятия, дедлайны и события группы</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => window.open('#cal.ics', '_blank')}>
            <Calendar className="h-4 w-4 mr-1" />
            Экспорт .ics
          </Button>
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Событие
          </Button>
        </div>
      </div>
      
      {/* View switcher & filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              {['month', 'week', 'day'].map(v => (
                <Button
                  key={v}
                  variant={view === v ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setView(v as 'month' | 'week' | 'day')}
                >
                  {v === 'month' && 'Месяц'}
                  {v === 'week' && 'Неделя'}
                  {v === 'day' && 'День'}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="search"
                  placeholder="Поиск событий..."
                  className="w-full h-10 pl-10 pr-4 rounded-small border border-border bg-surface text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
<Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full sm:w-40">
                <option value="all">Все типы</option>
                <option value="lesson">Занятия</option>
                <option value="call">Созвоны</option>
                <option value="deadline">Дедлайны</option>
                <option value="makeup">Отработки</option>
                <option value="other">Другое</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Calendar grid */}
      <Card>
        <CardContent className="pt-0">
          {view === 'month' ? (
            <MonthView
              weeks={weeks}
              currentMonth={currentMonth}
              getEventsForDay={getEventsForDay}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              onEventClick={handleEventClick}
              getEventColor={getEventColor}
              getEventIcon={getEventIcon}
              filterType={filterType}
              onPrevMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              onNextMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            />
          ) : (
            <div className="p-6 text-center text-text-secondary">
              <p>{view === 'week' ? 'Недельный вид' : 'Дневной вид'} — в разработке</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Event list sidebar */}
      <div className="lg:hidden">
        <Card>
          <CardHeader>
            <CardTitle>События на выбранный день</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary text-center py-8">Выберите день в календаре</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Event Detail Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEvent(null); }}
        title={selectedEvent?.title}
        size="md"
      >
        {selectedEvent && (
          <EventDetail event={selectedEvent} onClose={() => { setModalOpen(false); setSelectedEvent(null); }} />
        )}
      </Modal>
    </div>
  );
}

function MonthView({ 
  weeks, 
  currentMonth, 
  getEventsForDay, 
  isToday, 
  isCurrentMonth, 
  onEventClick,
  getEventColor,
  getEventIcon,
  filterType,
  onPrevMonth,
  onNextMonth,
}: {
  weeks: (Date | null)[][];
  currentMonth: Date;
  getEventsForDay: (date: Date) => typeof calendarEvents;
  isToday: (date: Date) => boolean;
  isCurrentMonth: (date: Date) => boolean;
  onEventClick: (event: typeof calendarEvents[0], e: React.MouseEvent) => void;
  getEventColor: (type: string) => string;
  getEventIcon: (type: string) => React.ReactNode;
  filterType: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  
  return (
    <div>
      {/* Month header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onPrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-text">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <Button variant="ghost" size="sm" onClick={onNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-bg">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => (
          <div key={i} className="p-3 text-center text-sm font-medium text-text-secondary">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((date, dayIndex) => {
              if (!date) return <div key={`${weekIndex}-${dayIndex}`} className="h-24" />;
              
              const events = getEventsForDay(date).filter(e => 
                filterType === 'all' || e.type === filterType
              );
              const isWeekend = dayIndex >= 5;
              
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    'relative min-h-[100px] p-2 border-r border-border border-b border-border',
                    !isCurrentMonth(date) && 'bg-gray-50',
                    isToday(date) && 'bg-primary/5 ring-2 ring-primary ring-inset',
                    isWeekend && 'bg-gray-50/50'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    isToday(date) ? 'text-primary' : 
                    !isCurrentMonth(date) ? 'text-gray-400' : 
                    isWeekend ? 'text-red-500' : 'text-text'
                  )}>
                    {date.getDate()}
                  </span>
                  
                  {/* Events */}
                  <div className="mt-1 space-y-1 max-h-[70px] overflow-y-auto scrollbar-thin">
                    {events.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        onClick={(e) => onEventClick(event, e)}
                        className={cn(
                          'w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs truncate text-white',
                          getEventColor(event.type)
                        )}
                        title={event.title}
                      >
                        {getEventIcon(event.type)}
                        <span className="truncate">{event.time} {event.title}</span>
                      </button>
                    ))}
                    {events.length > 3 && (
                      <button className="w-full text-center text-xs text-text-secondary hover:text-text py-1">
                        +{events.length - 3} еще
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t border-border flex flex-wrap gap-4">
        {[
          { type: 'lesson', label: 'Занятие' },
          { type: 'call', label: 'Созвон' },
          { type: 'deadline', label: 'Дедлайн' },
          { type: 'makeup', label: 'Отработка' },
          { type: 'other', label: 'Другое' },
        ].map(({ type, label }) => (
          <div key={type} className="flex items-center gap-2">
            <span className={cn('w-3 h-3 rounded', getEventColor(type))} />
            <span className="text-xs text-text-secondary">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventDetail({ event, onClose }: { event: typeof calendarEvents[0]; onClose: () => void }) {
  const typeLabels: Record<string, string> = {
    lesson: 'Занятие',
    call: 'Созвон',
    deadline: 'Дедлайн',
    makeup: 'Отработка',
    other: 'Другое',
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', getEventColor(event.type))}>
          {getEventIcon(event.type)}
        </div>
        <div>
          <p className="font-medium text-text">{event.title}</p>
          <p className="text-sm text-text-secondary">{typeLabels[event.type]}</p>
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 text-text-secondary">
          <Calendar className="h-4 w-4" />
          <span>{event.day} октября 2026</span>
        </div>
        <div className="flex items-center gap-3 text-text-secondary">
          <Clock className="h-4 w-4" />
          <span>{event.time}</span>
        </div>
        {event.group && (
          <div className="flex items-center gap-3 text-text-secondary">
            <Users className="h-4 w-4" />
            <span>{event.group}</span>
          </div>
        )}
        {event.teacher && (
          <div className="flex items-center gap-3 text-text-secondary">
            <Users className="h-4 w-4" />
            <span>{event.teacher}</span>
          </div>
        )}
      </div>
      
      {event.description && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-text-secondary">{event.description}</p>
        </div>
      )}
      
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Закрыть</Button>
        <Button variant="primary" className="flex-1">Напомнить за 15 мин</Button>
      </div>
    </div>
  );
}

function getEventColor(type: string) {
  const colors: Record<string, string> = {
    lesson: 'bg-blue-500',
    call: 'bg-purple-500',
    deadline: 'bg-red-500',
    makeup: 'bg-green-500',
    other: 'bg-gray-500',
  };
  return colors[type] || 'bg-gray-500';
}

function getEventIcon(type: string) {
  switch (type) {
    case 'lesson': return <Calendar className="h-3 w-3" />;
    case 'call': return <Users className="h-3 w-3" />;
    case 'deadline': return <AlertCircle className="h-3 w-3" />;
    case 'makeup': return <CheckCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
}