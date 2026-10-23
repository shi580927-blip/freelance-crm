import { Client, Project, Task, Transaction, ContentItem, TaxSettings, Reminder } from './types';

const STORAGE_KEYS = {
  clients: 'crm_clients',
  projects: 'crm_projects',
  tasks: 'crm_tasks',
  transactions: 'crm_transactions',
  content: 'crm_content',
  taxSettings: 'crm_tax_settings',
  reminders: 'crm_reminders',
};

export function loadData<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function loadSingle<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function saveData<T>(key: string, data: T[] | T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const initialClients: Client[] = [
  { id: 'c1', name: 'Алексей Петров', email: 'alex@company.ru', phone: '+7 (999) 123-45-67', company: 'TechStart', status: 'active', notes: 'Постоянный клиент, платит вовремя', createdAt: '2024-01-15' },
  { id: 'c2', name: 'Мария Иванова', email: 'maria@design.ru', phone: '+7 (999) 234-56-78', company: 'DesignLab', status: 'active', notes: 'Дизайн-агентство, нужны регулярные обновления', createdAt: '2024-02-20' },
  { id: 'c3', name: 'Дмитрий Козлов', email: 'dmitry@startup.io', phone: '+7 (999) 345-67-89', company: 'StartupIO', status: 'lead', notes: 'Заинтересован в разработке MVP', createdAt: '2024-03-10' },
  { id: 'c4', name: 'Елена Сидорова', email: 'elena@shop.ru', phone: '+7 (999) 456-78-90', company: 'ShopOnline', status: 'inactive', notes: 'Проект завершён, возможна повторная работа', createdAt: '2023-11-05' },
];

export const initialProjects: Project[] = [
  { id: 'p1', title: 'Редизайн лендинга', clientId: 'c1', status: 'in-progress', priority: 'high', deadline: '2024-04-30', budget: 85000, description: 'Полный редизайн главной страницы с адаптивной вёрсткой', type: 'client', createdAt: '2024-03-01' },
  { id: 'p2', title: 'Мобильное приложение', clientId: 'c2', status: 'review', priority: 'high', deadline: '2024-05-15', budget: 250000, description: 'Разработка iOS приложения для доставки', type: 'client', createdAt: '2024-02-01' },
  { id: 'p3', title: 'Интернет-магазин', clientId: 'c4', status: 'completed', priority: 'medium', deadline: '2024-01-30', budget: 180000, description: 'Разработка интернет-магазина на React', type: 'client', createdAt: '2023-11-01' },
  { id: 'p4', title: 'CRM система', clientId: 'c3', status: 'backlog', priority: 'medium', deadline: '2024-06-30', budget: 320000, description: 'Разработка CRM для управления клиентами', type: 'client', createdAt: '2024-03-15' },
  { id: 'p5', title: 'Контент-план блога TechStart', clientId: 'c1', status: 'in-progress', priority: 'medium', deadline: '2024-05-01', budget: 45000, description: 'Автоматический контент-план для блога: 3 поста в неделю', type: 'content-plan', createdAt: '2024-03-20' },
];

export const initialTasks: Task[] = [
  { id: 't1', title: 'Создать макет в Figma', projectId: 'p1', status: 'done', priority: 'high', dueDate: '2024-03-15', source: 'manual', createdAt: '2024-03-01' },
  { id: 't2', title: 'Вёрстка header и footer', projectId: 'p1', status: 'in-progress', priority: 'medium', dueDate: '2024-04-10', source: 'brief', createdAt: '2024-03-16' },
  { id: 't3', title: 'Интеграция с API', projectId: 'p1', status: 'todo', priority: 'high', dueDate: '2024-04-25', source: 'manual', createdAt: '2024-03-20' },
  { id: 't4', title: 'Тестирование на устройствах', projectId: 'p2', status: 'in-progress', priority: 'high', dueDate: '2024-05-01', source: 'auto', createdAt: '2024-04-01' },
  { id: 't5', title: 'Подготовить документацию', projectId: 'p2', status: 'todo', priority: 'low', dueDate: '2024-05-10', source: 'ai', createdAt: '2024-04-05' },
  { id: 't6', title: 'Написать пост: "10 трендов веб-дизайна"', projectId: 'p5', status: 'done', priority: 'medium', dueDate: '2024-03-25', source: 'ai', createdAt: '2024-03-20' },
  { id: 't7', title: 'Написать пост: "Как выбрать CMS"', projectId: 'p5', status: 'in-progress', priority: 'medium', dueDate: '2024-04-01', source: 'ai', createdAt: '2024-03-20' },
  { id: 't8', title: 'Написать пост: "SEO в 2024"', projectId: 'p5', status: 'todo', priority: 'medium', dueDate: '2024-04-08', source: 'ai', createdAt: '2024-03-20' },
];

export const initialTransactions: Transaction[] = [
  { id: 'tr1', type: 'income', category: 'Проект', amount: 42500, description: 'Предоплата за редизайн лендинга', projectId: 'p1', clientId: 'c1', date: '2024-03-05', source: 'manual' },
  { id: 'tr2', type: 'income', category: 'Проект', amount: 125000, description: 'Первый этап мобильное приложение', projectId: 'p2', clientId: 'c2', date: '2024-03-20', source: 'manual' },
  { id: 'tr3', type: 'expense', category: 'Подписки', amount: 3500, description: 'Figma Pro подписка', date: '2024-03-01', source: 'auto' },
  { id: 'tr4', type: 'expense', category: 'Оборудование', amount: 15000, description: 'Новый монитор', date: '2024-02-15', source: 'manual' },
  { id: 'tr5', type: 'expense', category: 'Обучение', amount: 8000, description: 'Курс по React Native', date: '2024-03-10', source: 'manual' },
  { id: 'tr6', type: 'income', category: 'Проект', amount: 180000, description: 'Финальная оплата интернет-магазин', projectId: 'p3', clientId: 'c4', date: '2024-02-01', source: 'manual' },
  { id: 'tr7', type: 'income', category: 'Проект', amount: 22500, description: 'Оплата за контент-план март', projectId: 'p5', clientId: 'c1', date: '2024-03-25', source: 'auto' },
];

export const initialContent: ContentItem[] = [
  { id: 'ci1', title: '10 трендов веб-дизайна 2024', type: 'article', platform: 'Блог', scheduledDate: '2024-03-25', status: 'published', source: 'ai', projectId: 'p5', clientId: 'c1', notes: 'Сгенерировано AI на основе анализа трендов', createdAt: '2024-03-20' },
  { id: 'ci2', title: 'Как выбрать CMS для бизнеса', type: 'article', platform: 'Блог', scheduledDate: '2024-04-01', status: 'in-progress', source: 'ai', projectId: 'p5', clientId: 'c1', notes: 'AI-сгенерированная структура', createdAt: '2024-03-20' },
  { id: 'ci3', title: 'SEO в 2024: полное руководство', type: 'article', platform: 'Блог', scheduledDate: '2024-04-08', status: 'planned', source: 'ai', projectId: 'p5', clientId: 'c1', notes: 'Запланировано AI', createdAt: '2024-03-20' },
  { id: 'ci4', title: 'Обзор нового проекта', type: 'post', platform: 'Telegram', scheduledDate: '2024-04-03', status: 'planned', source: 'auto', projectId: 'p5', clientId: 'c1', notes: 'Авто-пост из RSS', createdAt: '2024-03-25' },
  { id: 'ci5', title: 'Процесс разработки', type: 'story', platform: 'Instagram', scheduledDate: '2024-04-05', status: 'planned', source: 'manual', projectId: 'p5', clientId: 'c1', notes: 'Ручное создание', createdAt: '2024-03-26' },
];

export const initialTaxSettings: TaxSettings = {
  system: 'usn6',
  rate: 6,
  fixedContributions: 49500,
  enabled: true,
};

export const initialReminders: Reminder[] = [
  { id: 'r1', type: 'deadline', title: 'Дедлайн: Редизайн лендинга', date: '2024-04-30', daysBefore: 3, relatedId: 'p1', relatedType: 'project', done: false },
  { id: 'r2', type: 'deadline', title: 'Дедлайн: Мобильное приложение', date: '2024-05-15', daysBefore: 5, relatedId: 'p2', relatedType: 'project', done: false },
  { id: 'r3', type: 'tax', title: 'Авансовый платёж УСН (Q2)', date: '2024-04-28', daysBefore: 7, done: false },
  { id: 'r4', type: 'content', title: 'Публикация: SEO в 2024', date: '2024-04-08', daysBefore: 2, relatedId: 'ci3', relatedType: 'content', done: false },
];

export { STORAGE_KEYS };
