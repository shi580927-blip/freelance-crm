import { useState } from 'react';
import { Client, Project } from '../types';
import { generateId } from '../data';
import { formatMoney } from '../utils';
import DocumentGenerator from './DocumentGenerator';

interface ClientsProps {
  clients: Client[];
  projects: Project[];
  onUpdate: (clients: Client[]) => void;
  highlightId?: string;
}

export default function Clients({ clients, projects, onUpdate, highlightId }: ClientsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [expandedClient, setExpandedClient] = useState<string | null>(highlightId || null);
  const [docClient, setDocClient] = useState<{ client: Client; project?: Project } | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead' as Client['status'],
    notes: '',
  });

  const filteredClients = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      onUpdate(clients.map((c) => c.id === editingClient.id ? { ...c, ...form } : c));
    } else {
      const newClient: Client = {
        id: generateId(),
        ...form,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onUpdate([...clients, newClient]);
    }
    resetForm();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      status: client.status,
      notes: client.notes,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(clients.filter((c) => c.id !== id));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingClient(null);
    setForm({ name: '', email: '', phone: '', company: '', status: 'lead', notes: '' });
  };

  const toggleExpand = (id: string) => {
    setExpandedClient(expandedClient === id ? null : id);
  };

  const getClientProjects = (clientId: string) => {
    return projects.filter((p) => p.clientId === clientId);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: 'Активный', color: 'bg-green-100 text-green-700' },
    inactive: { label: 'Неактивный', color: 'bg-gray-100 text-gray-700' },
    lead: { label: 'Лид', color: 'bg-blue-100 text-blue-700' },
  };

  const projectStatusLabels: Record<string, { label: string; color: string; icon: string }> = {
    backlog: { label: 'Бэклог', color: 'bg-gray-100 text-gray-600', icon: '📋' },
    'in-progress': { label: 'В разработке', color: 'bg-blue-100 text-blue-700', icon: '🔄' },
    review: { label: 'На проверке', color: 'bg-amber-100 text-amber-700', icon: '👀' },
    completed: { label: 'Завершён', color: 'bg-green-100 text-green-700', icon: '✅' },
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Клиенты</h1>
          <p className="text-gray-500 mt-1">Управление вашей клиентской базой</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + Добавить клиента
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Поиск по имени, компании, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="inactive">Неактивные</option>
          <option value="lead">Лиды</option>
        </select>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.map((client) => {
          const clientProjects = getClientProjects(client.id);
          const isExpanded = expandedClient === client.id;
          return (
            <div
              key={client.id}
              className={`bg-white rounded-xl border transition-all ${
                highlightId === client.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
              }`}
            >
              {/* Client Row */}
              <div className="p-4 flex items-center gap-4">
                <button
                  onClick={() => toggleExpand(client.id)}
                  className={`text-gray-400 hover:text-gray-700 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                >
                  ▶
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-800">{client.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[client.status].color}`}>
                      {statusLabels[client.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{client.company} · {client.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {clientProjects.length > 0 && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                      📁 {clientProjects.length} {clientProjects.length === 1 ? 'проект' : 'проектов'}
                    </span>
                  )}
                  <button
                    onClick={() => setDocClient({ client, project: clientProjects[0] })}
                    className="text-gray-400 hover:text-blue-600 text-sm p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Создать документ"
                  >
                    📄
                  </button>
                  <button onClick={() => handleEdit(client)} className="text-gray-400 hover:text-gray-700 text-sm p-1.5">✏️</button>
                  <button onClick={() => handleDelete(client.id)} className="text-gray-400 hover:text-red-600 text-sm p-1.5">🗑️</button>
                </div>
              </div>

              {/* Expanded: Projects */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">Проекты клиента</h4>
                    <span className="text-xs text-gray-400">{clientProjects.length} шт.</span>
                  </div>
                  {clientProjects.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">У клиента пока нет проектов</p>
                  ) : (
                    <div className="space-y-2">
                      {clientProjects.map((project) => {
                        const pStatus = projectStatusLabels[project.status];
                        return (
                          <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-lg">{pStatus.icon}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{project.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${pStatus.color}`}>
                                    {pStatus.label}
                                  </span>
                                  <span className="text-xs text-gray-400">📅 {project.deadline}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs font-medium text-gray-600">{formatMoney(project.budget)}</span>
                              <button
                                onClick={() => setDocClient({ client, project })}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-md transition-colors"
                                title="Создать документ"
                              >
                                📄 Документ
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                    <button
                      onClick={() => setDocClient({ client })}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md transition-colors"
                    >
                      ✉️ Письмо клиенту
                    </button>
                    {clientProjects[0] && (
                      <button
                        onClick={() => setDocClient({ client, project: clientProjects[0] })}
                        className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-md transition-colors"
                      >
                        📄 Акт работ
                      </button>
                    )}
                    {clientProjects[0] && (
                      <button
                        onClick={() => setDocClient({ client, project: clientProjects[0] })}
                        className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md transition-colors"
                      >
                        📋 Договор
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Клиенты не найдены</p>
          <p className="text-sm">Добавьте первого клиента</p>
        </div>
      )}

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {editingClient ? 'Редактировать клиента' : 'Новый клиент'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Имя *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              <input type="text" placeholder="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              <input type="text" placeholder="Компания" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Client['status'] })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
                <option value="lead">Лид</option>
                <option value="active">Активный</option>
                <option value="inactive">Неактивный</option>
              </select>
              <textarea placeholder="Заметки" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" rows={3} />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                  {editingClient ? 'Сохранить' : 'Создать'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Generator Modal */}
      {docClient && (
        <DocumentGenerator
          client={docClient.client}
          project={docClient.project}
          onClose={() => setDocClient(null)}
        />
      )}
    </div>
  );
}
