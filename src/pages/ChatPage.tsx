import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Search, Bell, ChevronLeft, ChevronRight, Check, MessageSquare, X, Smile, Mic, Image, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Dropdown, DropdownItem, DropdownSeparator } from '../components/ui/Dropdown';
import { initialMessages } from '../data';
import { cn } from '../utils/cn';

export function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<'group' | 'teacher' | 'support'>('group');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chats = [
    { id: 'group', name: 'Общий чат группы', type: 'group', unread: 3, lastMessage: 'Иван Соколов: Отлично. Не забудьте...', time: '09:20' },
    { id: 'teacher', name: 'Иван Соколов', type: 'teacher', unread: 1, lastMessage: 'Вы: Спасибо за разбор!', time: 'Вчера' },
    { id: 'support', name: 'Поддержка', type: 'support', unread: 0, lastMessage: 'Бот: Чем могу помочь?', time: '2 дня назад' },
  ];
  
  const participants = [
    { id: 1, name: 'Иван Соколов', role: 'teacher', online: true },
    { id: 2, name: 'Алина Смирнова', role: 'student', online: true },
    { id: 3, name: 'Марк Орлов', role: 'student', online: false },
    { id: 4, name: 'София Ким', role: 'student', online: true },
    { id: 5, name: 'Данил Петров', role: 'student', online: false },
    { id: 6, name: 'Ева Морозова', role: 'student', online: true },
  ];
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      author: 'Алина Смирнова',
      role: 'student' as const,
      text: newMessage,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };
  
  const currentChat = chats.find(c => c.id === activeChat);
  
  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
      {/* Chat list sidebar */}
      <aside className={cn(
        'w-80 bg-surface border-r border-border flex flex-col transition-transform duration-300 lg:static',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text">Чаты</h2>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="search"
              placeholder="Поиск чатов..."
              className="w-full h-10 pl-10 pr-4 rounded-small border border-border bg-bg text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id as 'group' | 'teacher' | 'support')}
              className={cn(
                'w-full p-4 hover:bg-bg transition-colors flex items-start gap-3 text-left',
                activeChat === chat.id && 'bg-primary/5 border-l-2 border-primary'
              )}
            >
              <Avatar fallback={chat.name.split(' ').map(n => n[0]).join('').slice(0,2)} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-text truncate">{chat.name}</p>
                  <span className="text-xs text-text-secondary">{chat.time}</span>
                </div>
                <p className="text-sm text-text-secondary truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <Badge variant="info" className="ml-2">{chat.unread}</Badge>
              )}
            </button>
          ))}
        </div>
      </aside>
      
      {/* Mobile overlay */}
      {!sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(true)} />
      )}
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* Messages area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Avatar fallback={currentChat?.name.split(' ').map(n => n[0]).join('').slice(0,2)} size="md" />
              <div>
                <p className="font-medium text-text">{currentChat?.name}</p>
                <p className="text-xs text-text-secondary">
                  {activeChat === 'group' ? 'Групповой чат • 6 участников' : 'Личные сообщения'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm"><Bell className="h-5 w-5" /></Button>
              <Button variant="ghost" size="sm"><MoreVertical className="h-5 w-5" /></Button>
            </div>
          </div>
          
          {/* Pinned messages */}
          <div className="p-4 border-b border-border bg-bg">
            <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
              <MessageSquare className="h-3 w-3" />
              <span>Закрепленные сообщения</span>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-text">
                <strong>Важно:</strong> Дедлайн по React Router — пятница 08.10, 23:59. 
                Присылайте ссылки на GitHub в сдаче домашнего задания.
              </p>
            </div>
          </div>
          
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isOwn={message.role === 'student' && message.author === 'Алина Смирнова'} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <div className="p-4 border-t border-border bg-surface">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <div className="flex items-center gap-1 p-1 bg-bg rounded-lg flex-1">
                <Button variant="ghost" size="sm" type="button"><Smile className="h-5 w-5" /></Button>
                <Button variant="ghost" size="sm" type="button"><Image className="h-5 w-5" /></Button>
                <Button variant="ghost" size="sm" type="button"><FileText className="h-5 w-5" /></Button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Сообщение..."
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm px-2 py-2 max-h-32"
                  rows={1}
                />
              </div>
              <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
        
        {/* Participants sidebar */}
        <aside className={cn(
          'w-72 bg-surface border-l border-border hidden lg:block flex flex-col',
          showParticipants ? 'block' : 'hidden'
        )}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-text">Участники</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowParticipants(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar fallback={p.name.split(' ').map(n => n[0]).join('').slice(0,2)} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text truncate">{p.name}</p>
                  <p className="text-xs text-text-secondary capitalize">{p.role}</p>
                </div>
                <span className={cn('w-2 h-2 rounded-full', p.online ? 'bg-success' : 'bg-gray-400')} />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: typeof initialMessages[0]; isOwn: boolean }) {
  return (
    <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
      {!isOwn && <Avatar fallback={message.author.split(' ').map(n => n[0]).join('').slice(0,2)} size="sm" />}
      <div className={cn('flex-1 max-w-[70%]', isOwn ? 'text-right' : 'text-left')}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-text">{message.author}</span>
            <Badge variant={message.role === 'teacher' ? 'info' : 'neutral'} className="text-xs">
              {message.role === 'teacher' ? 'Преподаватель' : 'Ученик'}
            </Badge>
          </div>
        )}
        <div
          className={cn(
            'inline-block max-w-full px-4 py-2 rounded-2xl text-sm',
            isOwn
              ? 'bg-primary text-white rounded-tr-small'
              : 'bg-bg text-text rounded-tl-small'
          )}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        <div className={cn('flex items-center gap-1 mt-1 text-xs text-text-secondary', isOwn ? 'justify-end' : 'justify-start')}>
          <span>{message.time}</span>
          {isOwn && message.unread && <Check className="h-3 w-3 text-primary" />}
          {isOwn && !message.unread && <Check className="h-3 w-3 text-text-secondary" />}
        </div>
      </div>
      {isOwn && <Avatar fallback="АС" size="sm" />}
    </div>
  );
}