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
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
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
}

export type Page = 'dashboard' | 'clients' | 'projects' | 'tasks' | 'finances';
