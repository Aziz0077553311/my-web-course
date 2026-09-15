import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, MessageSquare, BarChart2, User, LogOut, Menu, X, Bell, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Dropdown, DropdownItem, DropdownSeparator } from '../components/ui/Dropdown';

const navigation = [
  { name: 'Главная', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Курс', href: '/dashboard', icon: BookOpen },
  { name: 'ДЗ', href: '/homework', icon: BookOpen },
  { name: 'Успеваемость', href: '/progress', icon: BarChart2 },
  { name: 'Календарь', href: '/calendar', icon: Calendar },
  { name: 'Чат', href: '/chat', icon: MessageSquare },
  { name: 'Профиль', href: '#', icon: User },
];

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const notifications = [
    { id: 1, text: 'Новое домашнее задание по React Router', time: '10 мин назад', unread: true },
    { id: 2, text: 'Ваше ДЗ по Flexbox принято', time: '1 час назад', unread: true },
    { id: 3, text: 'Завтра занятие в 09:00', time: 'Вчера', unread: false },
  ];
  
  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar text-white transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
            <span className="text-xl font-bold text-primary">EduFlow</span>
            <button
              className="lg:hidden text-white/70 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-small px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
          
          {/* User info */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Avatar fallback="АС" size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Алина Смирнова</p>
                <p className="text-xs text-white/50 truncate">Frontend · 09:00</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/80 backdrop-blur-sm px-4 lg:px-6">
          <button
            className="lg:hidden text-text hover:text-primary"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1" />
          
          {/* Search */}
          <div className="hidden md:block w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="search"
                placeholder="Поиск..."
                className="w-full h-9 rounded-full border border-border bg-bg pl-10 pr-4 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Notifications */}
          <Dropdown
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-5 w-5 text-text-secondary" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-error text-[10px] font-medium text-white flex items-center justify-center">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </Button>
            }
            content={
              <>
                <div className="px-3 py-2 border-b border-border font-medium text-text">Уведомления</div>
                {notifications.map((n) => (
                  <DropdownItem
                    key={n.id}
                    className={cn('py-2', n.unread && 'bg-primary/5')}
                    onClick={() => setNotificationsOpen(false)}
                  >
                    <div className="text-sm text-text">{n.text}</div>
                    <div className="text-xs text-text-secondary">{n.time}</div>
                  </DropdownItem>
                ))}
                <DropdownSeparator />
                <DropdownItem className="text-center text-primary" onClick={() => setNotificationsOpen(false)}>
                  Все уведомления
                </DropdownItem>
              </>
            }
          />
          
          {/* User menu */}
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar fallback="АС" size="sm" />
                <span className="hidden sm:block text-sm font-medium text-text">Алина Смирнова</span>
              </Button>
            }
            content={
              <>
                <DropdownItem>Профиль</DropdownItem>
                <DropdownItem>Настройки</DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={() => {}} destructive>
                  <LogOut className="h-4 w-4 mr-2" /> Выйти
                </DropdownItem>
              </>
            }
            align="end"
          />
        </header>
        
        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}