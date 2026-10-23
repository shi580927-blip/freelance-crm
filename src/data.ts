import { Client, Project, Task, Transaction } from './types';

const STORAGE_KEYS = {
  clients: 'crm_clients',
  projects: 'crm_projects',
  tasks: 'crm_tasks',
  transactions: 'crm_transactions',
};

export function loadData<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function saveData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const initialClients: Client[] = [
  {
    id: 'c1',
    name: 'Алексей Петров',
    email: 'alex@company.ru',
    phone: '+7 (999) 123-45-67',
    company: 'TechStart',
    status: 'active',
    notes: 'Постоянный клиент, платит вовремя',
    createdAt: '2024-01-15',
  },
  {
    id: 'c2',
    name: 'Мария Иванова',
    email: 'maria@design.ru',
    phone: '+7 (999) 234-56-78',
    company: 'DesignLab',
    status: 'active',
    notes: 'Дизайн-агентство, нужны регулярные обновления',
    createdAt: '2024-02-20',
  },
  {
    id: 'c3',
    name: 'Дмитрий Козлов',
    email: 'dmitry@startup.io',
    phone: '+7 (999) 345-67-89',
    company: 'StartupIO',
    status: 'lead',
    notes: 'Заинтересован в разработке MVP',
    createdAt: '2024-03-10',
  },
  {
    id: 'c4',
    name: 'Елена Сидорова',
    email: 'elena@shop.ru',
    phone: '+7 (999) 456-78-90',
    company: 'ShopOnline',
    status: 'inactive',
    notes: 'Проект завершён, возможна повторная работа',
    createdAt: '2023-11-05',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'p1',
    title: 'Редизайн лендинга',
    clientId: 'c1',
    status: 'in-progress',
    priority: 'high',
    deadline: '2024-04-30',
    budget: 85000,
    description: 'Полный редизайн главной страницы с адаптивной вёрсткой',
    createdAt: '2024-03-01',
  },
  {
    id: 'p2',
    title: 'Мобильное приложение',
    clientId: 'c2',
    status: 'review',
    priority: 'high',
    deadline: '2024-05-15',
    budget: 250000,
    description: 'Разработка iOS приложения для доставки',
    createdAt: '2024-02-01',
  },
  {
    id: 'p3',
    title: 'Интернет-магазин',
    clientId: 'c4',
    status: 'completed',
    priority: 'medium',
    deadline: '2024-01-30',
    budget: 180000,
    description: 'Разработка интернет-магазина на React',
    createdAt: '2023-11-01',
  },
  {
    id: 'p4',
    title: 'CRM система',
    clientId: 'c3',
    status: 'backlog',
    priority: 'medium',
    deadline: '2024-06-30',
    budget: 320000,
    description: 'Разработка CRM для управления клиентами',
    createdAt: '2024-03-15',
  },
];

export const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Создать макет в Figma',
    projectId: 'p1',
    status: 'done',
    priority: 'high',
    dueDate: '2024-03-15',
    createdAt: '2024-03-01',
  },
  {
    id: 't2',
    title: 'Вёрстка header и footer',
    projectId: 'p1',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2024-04-10',
    createdAt: '2024-03-16',
  },
  {
    id: 't3',
    title: 'Интеграция с API',
    projectId: 'p1',
    status: 'todo',
    priority: 'high',
    dueDate: '2024-04-25',
    createdAt: '2024-03-20',
  },
  {
    id: 't4',
    title: 'Тестирование на устройствах',
    projectId: 'p2',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-05-01',
    createdAt: '2024-04-01',
  },
  {
    id: 't5',
    title: 'Подготовить документацию',
    projectId: 'p2',
    status: 'todo',
    priority: 'low',
    dueDate: '2024-05-10',
    createdAt: '2024-04-05',
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tr1',
    type: 'income',
    category: 'Проект',
    amount: 42500,
    description: 'Предоплата за редизайн лендинга',
    projectId: 'p1',
    clientId: 'c1',
    date: '2024-03-05',
  },
  {
    id: 'tr2',
    type: 'income',
    category: 'Проект',
    amount: 125000,
    description: 'Первый этап мобильное приложение',
    projectId: 'p2',
    clientId: 'c2',
    date: '2024-03-20',
  },
  {
    id: 'tr3',
    type: 'expense',
    category: 'Подписки',
    amount: 3500,
    description: 'Figma Pro подписка',
    date: '2024-03-01',
  },
  {
    id: 'tr4',
    type: 'expense',
    category: 'Оборудование',
    amount: 15000,
    description: 'Новый монитор',
    date: '2024-02-15',
  },
  {
    id: 'tr5',
    type: 'expense',
    category: 'Обучение',
    amount: 8000,
    description: 'Курс по React Native',
    date: '2024-03-10',
  },
  {
    id: 'tr6',
    type: 'income',
    category: 'Проект',
    amount: 180000,
    description: 'Финальная оплата интернет-магазин',
    projectId: 'p3',
    clientId: 'c4',
    date: '2024-02-01',
  },
];

export { STORAGE_KEYS };
