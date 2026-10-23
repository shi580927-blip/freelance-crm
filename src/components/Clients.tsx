import { useState } from 'react';
import { Client } from '../types';
import { generateId } from '../data';

interface ClientsProps {
  clients: Client[];
  onUpdate: (clients: Client[]) => void;
}

export default function Clients({ clients, onUpdate }: ClientsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

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

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: 'Активный', color: 'bg-green-100 text-green-700' },
    inactive: { label: 'Неактивный', color: 'bg-gray-100 text-gray-700' },
    lead: { label: 'Лид', color: 'bg-blue-100 text-blue-700' },
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

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {editingClient ? 'Редактировать клиента' : 'Новый клиент'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Имя *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <input
                type="text"
                placeholder="Телефон"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <input
                type="text"
                placeholder="Компания"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Client['status'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="lead">Лид</option>
                <option value="active">Активный</option>
                <option value="inactive">Неактивный</option>
              </select>
              <textarea
                placeholder="Заметки"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                rows={3}
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  {editingClient ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Клиент</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Компания</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Контакты</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.notes}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.company}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[client.status].color}`}>
                    {statusLabels[client.status].label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">{client.email}</p>
                  <p className="text-xs text-gray-400">{client.phone}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEdit(client)}
                    className="text-gray-400 hover:text-gray-700 mr-3 text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="text-gray-400 hover:text-red-600 text-sm"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Клиенты не найдены</p>
            <p className="text-sm">Добавьте первого клиента</p>
          </div>
        )}
      </div>
    </div>
  );
}
