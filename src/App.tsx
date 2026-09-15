import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { StudentDashboard } from './pages/StudentDashboard';
import { LessonPage } from './pages/LessonPage';
import { HomeworkPage } from './pages/HomeworkPage';
import { ProgressPage } from './pages/ProgressPage';
import { CalendarPage } from './pages/CalendarPage';
import { ChatPage } from './pages/ChatPage';
import { AdminPanel } from './pages/AdminPanel';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="lesson/:id" element={<LessonPage />} />
          <Route path="homework" element={<HomeworkPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}