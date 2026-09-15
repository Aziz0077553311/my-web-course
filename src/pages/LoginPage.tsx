import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo credentials
    if (email === 'student@demo.com' && password === 'demo123') {
      localStorage.setItem('userRole', 'student');
      localStorage.setItem('userName', 'Алина Смирнова');
      navigate('/dashboard');
    } else if (email === 'teacher@demo.com' && password === 'demo123') {
      localStorage.setItem('userRole', 'teacher');
      localStorage.setItem('userName', 'Иван Соколов');
      navigate('/admin');
    } else if (email === 'admin@demo.com' && password === 'demo123') {
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', 'Администратор');
      navigate('/admin');
    } else {
      setError('Неверный email или пароль. Используйте demo-аккаунты.');
    }
    
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="inline-block mb-6">
            <span className="text-xl font-bold text-primary">EduFlow</span>
          </Link>
          <CardTitle>Вход в аккаунт</CardTitle>
          <CardDescription>Введите ваши данные для доступа к платформе</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">Роль</label>
              <div className="grid grid-cols-3 gap-2">
                {['student', 'teacher', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r as 'student' | 'teacher' | 'admin')}
                    className={cn(
                      'py-2 px-3 rounded-small text-sm font-medium transition-colors',
                      role === r
                        ? 'bg-primary text-white'
                        : 'bg-border text-text-secondary hover:bg-border/80'
                    )}
                  >
                    {r === 'student' && 'Ученик'}
                    {r === 'teacher' && 'Преподаватель'}
                    {r === 'admin' && 'Админ'}
                  </button>
                ))}
              </div>
            </div>
            
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@demo.com"
              required
              autoComplete="email"
            />
            
            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo123"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-text-secondary hover:text-text"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {error && (
              <div className="p-3 rounded-small bg-red-50 text-red-600 text-sm" role="alert">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full" loading={loading}>
              Войти
            </Button>
          </form>
          
          <div className="mt-6 space-y-3 text-sm text-text-secondary">
            <p>Демо-доступы:</p>
            <div className="text-left space-y-1 font-mono text-xs bg-bg p-3 rounded-small">
              <div><strong>Ученик:</strong> student@demo.com / demo123</div>
              <div><strong>Преподаватель:</strong> teacher@demo.com / demo123</div>
              <div><strong>Админ:</strong> admin@demo.com / demo123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}