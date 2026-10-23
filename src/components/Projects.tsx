import { useState } from 'react';
import { Project, Client } from '../types';
import { generateId } from '../data';

interface ProjectsProps {
  projects: Project[];
  clients: Client[];
  onUpdate: (projects: Project[]) => void;
}

type Status = Project['status'];

const statusConfig: Record<Status, { label: string; color: string; bgColor: string }> = {
  backlog: { label: 'Бэклог', color: 'border-gray-300', bgColor: 'bg-gray-50' },
  'in-progress': { label: 'В работе', color: 'border-blue-400', bgColor: 'bg-blue-50' },
  review: { label: 'На проверке', color: 'border-amber-400', bgColor: 'bg-amber-50' },
  completed: { label: 'Завершено', color: 'border-green-400', bgColor: 'bg-green-50' },
};

export default function Projects({ projects, clients, onUpdate }: ProjectsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [view, setView] = useState<'board' | 'list'>('board');

  const [form, setForm] = useState({
    title: '',
    clientId: '',
    status: 'backlog' as Status,
    priority: 'medium' as Project['priority'],
    deadline: '',
    budget: 0,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      onUpdate(projects.map((p) => p.id === editingProject.id ? { ...p, ...form } : p));
    } else {
      const newProject: Project = {
        id: generateId(),
        ...form,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onUpdate([...projects, newProject]);
    }
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      clientId: project.clientId,
      status: project.status,
      priority: project.priority,
      deadline: project.deadline,
      budget: project.budget,
      description: project.description,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(projects.filter((p) => p.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: Status) => {
    onUpdate(projects.map((p) => p.id === id ? { ...p, status: newStatus } : p));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setForm({ title: '', clientId: '', status: 'backlog', priority: 'medium', deadline: '', budget: 0, description: '' });
  };

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.company || 'Не указан';
  };

  const priorityColors: Record<string, string> = {
    high: 'border-l-red-400',
    medium: 'border-l-amber-400',
    low: 'border-l-green-400',
  };

  const priorityLabels: Record<string, string> = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  const statuses: Status[] = ['backlog', 'in-progress', 'review', 'completed'];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Проекты</h1>
          <p className="text-gray-500 mt-1">Управление проектами и задачами</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('board')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'board' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              }`}
            >
              Доска
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              }`}
            >
              Список
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + Новый проект
          </button>
        </div>
      </div>

      {/* Board View */}
      {view === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statuses.map((status) => {
            const config = statusConfig[status];
            const statusProjects = projects.filter((p) => p.status === status);
            return (
              <div key={status} className={`${config.bgColor} rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700 text-sm">{config.label}</h3>
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-600">
                    {statusProjects.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {statusProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${priorityColors[project.priority]} cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => handleEdit(project)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-800">{project.title}</h4>
                        <span className="text-sm">{priorityLabels[project.priority]}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{getClientName(project.clientId)}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">📅 {project.deadline}</span>
                        <span className="text-xs font-medium text-gray-600">
                          {new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(project.budget)} ₽
                        </span>
                      </div>
                      {status !== 'completed' && status !== statuses[statuses.length - 1] && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <select
                            value={project.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(project.id, e.target.value as Status);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none"
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>{statusConfig[s].label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Проект</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Клиент</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Дедлайн</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Бюджет</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span>{priorityLabels[project.priority]}</span>
                      <span className="text-sm font-medium text-gray-800">{project.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getClientName(project.clientId)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusChange(project.id, e.target.value as Status)}
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{statusConfig[s].label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{project.deadline}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(project.budget)} ₽
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(project)} className="text-gray-400 hover:text-gray-700 mr-3 text-sm">✏️</button>
                    <button onClick={() => handleDelete(project.id)} className="text-gray-400 hover:text-red-600 text-sm">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingProject ? 'Редактировать проект' : 'Новый проект'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Название проекта *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="">Выберите клиента *</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                ))}
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{statusConfig[s].label}</option>
                ))}
              </select>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Project['priority'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="low">Низкий приоритет</option>
                <option value="medium">Средний приоритет</option>
                <option value="high">Высокий приоритет</option>
              </select>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <input
                type="number"
                placeholder="Бюджет (₽)"
                value={form.budget || ''}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <textarea
                placeholder="Описание"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                rows={3}
              />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                  {editingProject ? 'Сохранить' : 'Создать'}
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
