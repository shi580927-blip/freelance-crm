export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'lead';
  notes: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  status: 'backlog' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  budget: number;
  description: string;
  type?: 'client' | 'content-plan' | 'internal';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  source?: 'manual' | 'ai' | 'auto' | 'brief';
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  projectId?: string;
  clientId?: string;
  date: string;
  source?: 'manual' | 'auto' | 'import';
}

// Content Plan / Automation
export interface ContentItem {
  id: string;
  title: string;
  type: 'post' | 'story' | 'reel' | 'article' | 'newsletter' | 'video';
  platform: string;
  scheduledDate: string;
  status: 'planned' | 'in-progress' | 'done' | 'published';
  source: 'manual' | 'ai' | 'auto' | 'brief';
  projectId?: string;
  clientId?: string;
  notes: string;
  createdAt: string;
}

// Tax settings
export type TaxSystem = 'usn6' | 'usn15' | 'npd' | 'osno' | 'patent';

export interface TaxSettings {
  system: TaxSystem;
  rate: number;
  expensesDeduction?: number;
  fixedContributions: number;
  enabled: boolean;
}

// Reminder
export interface Reminder {
  id: string;
  type: 'deadline' | 'payment' | 'tax' | 'content' | 'custom';
  title: string;
  date: string;
  daysBefore: number;
  relatedId?: string;
  relatedType?: 'project' | 'task' | 'content' | 'transaction';
  done: boolean;
}

export type Page = 'dashboard' | 'clients' | 'projects' | 'tasks' | 'finances' | 'calendar' | 'content' | 'taxes';
export type CalendarView = 'month' | 'week' | 'day';
export type FinanceGroupBy = 'day' | 'week' | 'month' | 'year';
export type DateRange = 'day' | 'week' | 'month' | 'year' | 'custom';

export interface DateRangeState {
  range: DateRange;
  startDate: string;
  endDate: string;
}
