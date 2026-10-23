import { useState } from 'react';
import { Task, Project, Client } from '../types';
import { generateId } from '../data';
import { Page } from '../types';

interface TasksProps {
  tasks: Task[];
  projects: Project[];
  clients: Client[];
  onUpdate: (tasks: Task[]) => void;
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}

export default function Tasks({ tasks, projects, clients, onUpdate, onNavigate }: TasksProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const [form, setForm] = useState({
    title: '',
    projectId: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
  });

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onUpdate(tasks.map((t) => t.id === editingTask.id ? { ...t, ...form } : t));
    } else {
      const newTask: Task = {
        id: generateId(),
        ...form,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onUpdate([...tasks, newTask]);
    }
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(tasks.filter((t) => t.id !== id));
  };

  const handleStatusToggle = (id: string) => {
    onUpdate(tasks.map((t) => {
      if (t.id !== id) return t;
      const nextStatus: Record<string, Task['status']> = {
        'todo': 'in-progress',
        'in-progress': 'done',
        'done': 'todo',
      };
      return { ...t, status: nextStatus[t.status] };
    }));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setForm({ title: '', projectId: '', status: 'todo', priority: 'medium', dueDate: '' });
  };

  const getProject = (projectId: string) => projects.find((p) => p.id === projectId);
  const getProjectClient = (projectId: string) => {
    const project = getProject(projectId);
    return project ? clients.find((c) => c.id === project.clientId) : undefined;
  };

  const statusIcons: Record<string, string> = {
    todo: '○',
    'in-progress': '◐',
    done: '●',
  };

  const statusLabels: Record<string, string> = {
    todo: 'К выполнению',
    'in-progress': 'В работе',
    done: 'Готово',
  };

  const statusColors: Record<string, string> = {
    todo: 'text-gray-400',
    'in-progress': 'text-blue-500',
    done: 'text-green-500',
  };

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Задачи</h1>
          <p className="text-gray-500 mt-1">Отслеживайте выполнение задач по проектам</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + Новая задача
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{todoCount}</p>
          <p className="text-xs text-gray-500 mt-1">К выполнению</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{inProgressCount}</p>
          <p className="text-xs text-gray-500 mt-1">В работе</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{doneCount}</p>
          <p className="text-xs text-gray-500 mt-1">Готово</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'todo', 'in-progress', 'done'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Все' : statusLabels[f]}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const project = getProject(task.projectId);
          const client = getProjectClient(task.projectId);
          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow ${
                task.status === 'done' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Status Toggle */}
                <button
                  onClick={() => handleStatusToggle(task.id)}
                  className={`text-2xl ${statusColors[task.status]} hover:scale-110 transition-transform`}
                  title={statusLabels[task.status]}
                >
                  {statusIcons[task.status]}
                </button>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    {project && (
                      <button
                        onClick={() => onNavigate('projects', { highlight: project.id })}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2 py-0.5 rounded-md transition-colors"
                        title="Открыть проект"
                      >
                        📁 {project.title}
                      </button>
                    )}
                    {client && (
                      <button
                        onClick={() => onNavigate('clients', { highlight: client.id })}
                        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 hover:underline bg-purple-50 px-2 py-0.5 rounded-md transition-colors"
                        title="Открыть клиента"
                      >
                        👤 {client.name}
                      </button>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-gray-400">📅 {task.dueDate}</span>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <span className="text-sm">
                  {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(task)} className="text-gray-400 hover:text-gray-700 text-sm">✏️</button>
                  <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-600 text-sm">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg">Задач нет</p>
          <p className="text-sm">Создайте первую задачу</p>
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {editingTask ? 'Редактировать задачу' : 'Новая задача'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Название задачи *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <select
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="">Без проекта</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="todo">К выполнению</option>
                <option value="in-progress">В работе</option>
                <option value="done">Готово</option>
              </select>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="low">Низкий приоритет</option>
                <option value="medium">Средний приоритет</option>
                <option value="high">Высокий приоритет</option>
              </select>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                  {editingTask ? 'Сохранить' : 'Создать'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
