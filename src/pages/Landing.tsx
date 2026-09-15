import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Users, Code, Globe, BookOpen, Award, Zap, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { modules, projectCards, faqItems } from '../data';
import { cn } from '../utils/cn';

export function Landing() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-sm border-b border-border">
        <nav className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-primary">EduFlow</Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="#program" className="text-text-secondary hover:text-text transition-colors">Программа</Link>
              <Link to="#projects" className="text-text-secondary hover:text-text transition-colors">Проекты</Link>
              <Link to="#teacher" className="text-text-secondary hover:text-text transition-colors">Преподаватель</Link>
              <Link to="#pricing" className="text-text-secondary hover:text-text transition-colors">Стоимость</Link>
              <Link to="#faq" className="text-text-secondary hover:text-text transition-colors">FAQ</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Войти</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Записаться на курс</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 lg:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge variant="info" className="mb-6 inline-flex">Новый набор: 15 октября 2026</Badge>
              <h1 className="text-4xl lg:text-5xl lg:leading-[56px] font-bold text-text mb-6">
                Станьте полноценным разработчиком за 3 месяца
              </h1>
              <p className="text-lg text-text-secondary mb-8 max-w-xl">
                Интенсивный курс по веб-разработке и Machine Learning. 50 уроков, реальные проекты, проверка кода преподавателями и поддержка до трудоустройства.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button size="lg" className="gap-2">
                    Начать обучение
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="#program">
                  <Button variant="secondary" size="lg">Подробнее о программе</Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>4 занятия в неделю</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>50 практических уроков</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>6 готовых проектов в портфолио</span>
                </div>
              </div>
            </div>
            
            {/* Hero illustration */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                <div className="text-center p-8">
                  <Code className="h-32 w-32 text-primary/50 mx-auto mb-6" />
                  <div className="space-y-3 text-center">
                    <div className="h-4 w-3/4 bg-primary/20 rounded mx-auto" />
                    <div className="h-4 w-1/2 bg-primary/10 rounded mx-auto" />
                    <div className="h-4 w-5/6 bg-primary/20 rounded mx-auto" />
                  </div>
                </div>
              </div>
              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 w-48 h-48 bg-surface rounded-xl shadow-card border border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">94%</p>
                    <p className="text-xs text-text-secondary">трудоустройства</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">4.9/5</p>
                    <p className="text-xs text-text-secondary">оценка курса</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="50+" label="Уроков практики" icon={BookOpen} />
            <StatCard value="6" label="Проектов в портфолио" icon={Award} />
            <StatCard value="500+" label="Выпускников" icon={Users} />
            <StatCard value="24/7" label="Поддержка в чате" icon={MessageSquare} />
          </div>
        </div>
      </section>

      {/* Program */}
      <section id="program" className="py-20 lg:py-28 px-4 lg:px-6 bg-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">Программа курса</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">Что вы изучите за 3 месяца</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">7 блоков, 50 уроков — от основ программирования до нейросетей и финального ML-проекта</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-20 lg:py-28 px-4 lg:px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">Проекты учеников</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">Реальные работы наших выпускников</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Каждый проект — решение реальной задачи, которую можно показать работодателю</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {projectCards.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28 px-4 lg:px-6 bg-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">Как проходит обучение</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">Эффективный формат без воды</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={Zap} title="Интенсивные занятия" description="4 раза в неделю по 1.5–2 часа. Теория сразу на практике — пишем код вместе с преподавателем." />
            <FeatureCard icon={Code} title="Домашние задания" description="После каждого урока — практика. Преподаватель проверяет код, дает ревью и оценку. Можно сдавать повторно." />
            <FeatureCard icon={Globe} title="Проекты в портфолио" description="6 крупных проектов: лендинг, React-приложение, REST API, ML-модель и др. Готовые кейсы для резюме." />
          </div>
        </div>
      </section>

      {/* Teacher */}
      <section id="teacher" className="py-20 lg:py-28 px-4 lg:px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="aspect-video max-w-md mx-auto lg:mx-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
              <Users className="h-24 w-24 text-primary/50" />
            </div>
            <div>
              <Badge variant="info" className="mb-4">Ваш преподаватель</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">Иван Соколов — Senior Fullstack Developer</h2>
              <p className="text-text-secondary mb-6">
                8+ лет в разработке. Работал в Яндексе, Тинькофф и стартапах Silicon Valley. 
                Автор открытых библиотек на 5k+ звезд на GitHub. Учит с 2019 года — более 300 студентов уже работают в IT.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>React, Node.js, Python, ML</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Google Developer Expert</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Автор курса по System Design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 px-4 lg:px-6 bg-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">Стоимость</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">Прозрачная цена без скрытых платежей</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Всё включено: занятия, проверка ДЗ, материалы, чат, поддержка преподавателя</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <PricingCard />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28 px-4 lg:px-6 bg-surface">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">Частые вопросы</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">Ответы на популярные вопросы</h2>
          </div>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <FAQItem key={index} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 px-4 lg:px-6 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Готовы начать путь в IT?</h2>
          <p className="text-primary-100 mb-8 text-lg">Запишитесь на бесплатную вводную встречу и получите индивидуальный план обучения</p>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2">
              Записаться на вводную
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-white py-12 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-semibold mb-4">EduFlow</h3>
              <p className="text-white/60 text-sm">Образовательная платформа нового поколения. Учим программированию и ML с 2021 года.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Курсы</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>Fullstack разработка</li>
                <li>Machine Learning</li>
                <li>Python Backend</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>О нас</li>
                <li>Преподаватели</li>
                <li>Отзывы</li>
                <li>Блог</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>hello@eduflow.ru</li>
                <li>+7 (999) 000-00-00</li>
                <li>Москва, ул. Примерная, 1</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/50">
            © 2026 EduFlow. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="text-center py-8">
      <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
      <p className="text-3xl font-bold text-text">{value}</p>
      <p className="text-sm text-text-secondary mt-1">{label}</p>
    </Card>
  );
}

function ModuleCard({ module }: { module: typeof modules[0] }) {
  return (
    <Card className="group hover:shadow-lg transition-shadow h-full">
      <div className="p-6">
        <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: `${module.accent}20` }}>
          <BookOpen className="h-6 w-6" style={{ color: module.accent }} />
        </div>
        <h3 className="font-semibold text-text mb-2">{module.title}</h3>
        <p className="text-sm text-text-secondary mb-3">{module.description}</p>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="px-2 py-0.5 rounded bg-border">{module.lessonRange} уроков</span>
        </div>
      </div>
    </Card>
  );
}

function ProjectCard({ project }: { project: typeof projectCards[0] }) {
  return (
    <Card className="h-full overflow-hidden">
      <div className="aspect-video" style={{ backgroundColor: project.color }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Code className="h-16 w-16 text-primary/30" />
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-text mb-1">{project.title}</h3>
        <p className="text-xs text-text-secondary mb-3">{project.meta}</p>
        <p className="text-sm text-text-secondary">{project.description}</p>
      </div>
    </Card>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <Card className="h-full">
      <div className="p-6">
        <div className="w-12 h-12 rounded-lg bg-primary/10 mb-4 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold text-text mb-2">{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </Card>
  );
}

function PricingCard() {
  return (
    <Card className="relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
        Лучший выбор
      </div>
      <div className="p-8 text-center">
        <div className="mb-6">
          <span className="text-5xl font-bold text-text">4 000</span>
          <span className="text-text-secondary">/мес</span>
        </div>
        <p className="text-text-secondary mb-8">Полный доступ ко всем материалам на 3 месяца</p>
        <ul className="space-y-3 mb-8 text-left">
          {[
            '50 уроков с практикой',
            'Проверка всех ДЗ преподавателем',
            '6 проектов в портфолио',
            'Чат с преподавателем и группой',
            'Вебинары и консультации',
            'Сертификат о завершении',
            'Помощь с трудоустройством',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-text">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <Link to="/login">
          <Button className="w-full" size="lg">Записаться на курс</Button>
        </Link>
        <p className="mt-4 text-xs text-text-secondary">Можно оплатить частями: 4 000₽/мес × 3 месяца</p>
      </div>
    </Card>
  );
}

function FAQItem({ item }: { item: typeof faqItems[0] }) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-6 text-left flex items-center justify-between gap-4"
      >
        <span className="font-medium text-text">{item.question}</span>
        <Star className={cn('h-5 w-5 text-text-secondary transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-0 text-text-secondary border-t border-border">
          {item.answer}
        </div>
      )}
    </Card>
  );
}