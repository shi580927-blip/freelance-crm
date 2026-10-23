import { useState } from 'react';
import { ContentItem, Project, Client } from '../types';
import { generateId } from '../data';

interface ContentPlanProps {
  content: ContentItem[];
  projects: Project[];
  clients: Client[];
  onUpdate: (content: ContentItem[]) => void;
}

export default function ContentPlan({ content, projects, clients, onUpdate }: ContentPlanProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showAutomation, setShowAutomation] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'post' as ContentItem['type'],
    platform: '',
    scheduledDate: '',
    status: 'planned' as ContentItem['status'],
    source: 'manual' as ContentItem['source'],
    projectId: '',
    clientId: '',
    notes: '',
  });

  const contentProjects = projects.filter((p) => p.type === 'content-plan');

  const filteredContent = content.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'auto') return c.source === 'auto';
    if (filter === 'ai') return c.source === 'ai';
    return c.status === filter;
  }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdate(content.map((c) => c.id === editingItem.id ? { ...c, ...form } : c));
    } else {
      const newItem: ContentItem = {
        id: generateId(),
        ...form,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onUpdate([...content, newItem]);
    }
    resetForm();
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      type: item.type,
      platform: item.platform,
      scheduledDate: item.scheduledDate,
      status: item.status,
      source: item.source,
      projectId: item.projectId || '',
      clientId: item.clientId || '',
      notes: item.notes,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(content.filter((c) => c.id !== id));
  };

  const handleStatusChange = (id: string, status: ContentItem['status']) => {
    onUpdate(content.map((c) => c.id === id ? { ...c, status } : c));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setForm({ title: '', type: 'post', platform: '', scheduledDate: '', status: 'planned', source: 'manual', projectId: '', clientId: '', notes: '' });
  };

  // Generate AI content suggestions
  const generateAISuggestions = () => {
    const suggestions: ContentItem[] = [
      {
        id: generateId(),
        title: 'AI-сгенерированный пост: Тренды дизайна',
        type: 'post',
        platform: 'Telegram',
        scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        status: 'planned',
        source: 'ai',
        notes: '🤖 Сгенерировано AI на основе анализа аудитории',
        createdAt: new Date().toISOString().split('T')[0],
      },
      {
        id: generateId(),
        title: 'AI-обзор: Новые инструменты разработки',
        type: 'article',
        platform: 'Блог',
        scheduledDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        status: 'planned',
        source: 'ai',
        notes: '🤖 AI подобрал тему на основе поисковых запросов',
        createdAt: new Date().toISOString().split('T')[0],
      },
    ];
    onUpdate([...content, ...suggestions]);
    setShowAutomation(false);
  };

  const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
    planned: { label: 'Запланировано', color: 'bg-blue-100 text-blue-700', icon: '📋' },
    'in-progress': { label: 'В работе', color: 'bg-amber-100 text-amber-700', icon: '🔄' },
    done: { label: 'Готово', color: 'bg-green-100 text-green-700', icon: '✅' },
    published: { label: 'Опубликовано', color: 'bg-purple-100 text-purple-700', icon: '🚀' },
  };

  const sourceLabels: Record<string, { label: string; color: string; icon: string }> = {
    manual: { label: 'Вручную', color: 'bg-gray-100 text-gray-600', icon: '✍️' },
    ai: { label: 'AI', color: 'bg-indigo-100 text-indigo-700', icon: '🤖' },
    auto: { label: 'Авто', color: 'bg-cyan-100 text-cyan-700', icon: '⚙️' },
    brief: { label: 'Бриф', color: 'bg-orange-100 text-orange-700', icon: '📝' },
  };

  const typeLabels: Record<string, string> = {
    post: 'Пост',
    story: 'Сторис',
    reel: 'Reels',
    article: 'Статья',
    newsletter: 'Рассылка',
    video: 'Видео',
  };

  const plannedCount = content.filter(c => c.status === 'planned').length;
  const inProgressCount = content.filter(c => c.status === 'in-progress').length;
  const publishedCount = content.filter(c => c.status === 'published').length;
  const autoCount = content.filter(c => c.source === 'auto' || c.source === 'ai').length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Контент-план</h1>
          <p className="text-gray-500 mt-1">Автоматизация и планирование контента</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAutomation(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            🤖 AI-генерация
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + Добавить
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{plannedCount}</p>
          <p className="text-xs text-blue-600 mt-1">Запланировано</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{inProgressCount}</p>
          <p className="text-xs text-amber-600 mt-1">В работе</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-100 p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{publishedCount}</p>
          <p className="text-xs text-purple-600 mt-1">Опубликовано</p>
        </div>
        <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-700">{autoCount}</p>
          <p className="text-xs text-indigo-600 mt-1">Авто/AI</p>
        </div>
      </div>

      {/* Content Projects */}
      {contentProjects.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4 mb-6">
          <h3 className="text-sm font-semibold text-indigo-800 mb-2">📋 Контент-проекты</h3>
          <div className="flex flex-wrap gap-2">
            {contentProjects.map((p) => (
              <div key={p.id} className="bg-white rounded-lg px-3 py-2 border border-indigo-200">
                <p className="text-sm font-medium text-gray-800">{p.title}</p>
                <p className="text-xs text-gray-500">
                  {clients.find(c => c.id === p.clientId)?.company} · {p.status === 'in-progress' ? '🔄 В работе' : p.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'all', label: 'Все' },
          { value: 'planned', label: '📋 Запланировано' },
          { value: 'in-progress', label: '🔄 В работе' },
          { value: 'published', label: '🚀 Опубликовано' },
          { value: 'ai', label: '🤖 AI' },
          { value: 'auto', label: '⚙️ Авто' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {filteredContent.map((item) => {
          const status = statusLabels[item.status];
          const source = sourceLabels[item.source];
          const project = projects.find(p => p.id === item.projectId);
          const isAuto = item.source === 'auto' || item.source === 'ai';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-4 ${
                isAuto ? 'border-indigo-200 bg-gradient-to-r from-white to-indigo-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Date */}
                <div className="text-center flex-shrink-0 w-14">
                  <div className="text-xs text-gray-400">
                    {new Date(item.scheduledDate).toLocaleDateString('ru-RU', { month: 'short' })}
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {new Date(item.scheduledDate).getDate()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    {isAuto && (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${source.color}`}>
                        {source.icon} {source.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-500">{typeLabels[item.type]}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">📱 {item.platform}</span>
                    {project && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-indigo-600">📁 {project.title}</span>
                      </>
                    )}
                    {item.notes && (
                      <span className="text-xs text-gray-400 italic truncate max-w-xs">{item.notes}</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value as ContentItem['status'])}
                  className={`text-xs px-2 py-1 rounded-lg border font-medium ${status.color} border-transparent focus:outline-none`}
                >
                  <option value="planned">📋 Запланировано</option>
                  <option value="in-progress">🔄 В работе</option>
                  <option value="done">✅ Готово</option>
                  <option value="published">🚀 Опубликовано</option>
                </select>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-gray-700 text-sm p-1">✏️</button>
                  <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600 text-sm p-1">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-lg">Нет контента</p>
          <p className="text-sm">Создайте первый элемент или используйте AI-генерацию</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingItem ? 'Редактировать' : 'Новый контент'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Заголовок *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContentItem['type'] })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="post">Пост</option>
                <option value="story">Сторис</option>
                <option value="reel">Reels</option>
                <option value="article">Статья</option>
                <option value="newsletter">Рассылка</option>
                <option value="video">Видео</option>
              </select>
              <input type="text" placeholder="Платформа (Telegram, Instagram...)" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as ContentItem['source'] })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="manual">✍️ Вручную</option>
                <option value="ai">🤖 AI</option>
                <option value="auto">⚙️ Автоматически</option>
                <option value="brief">📝 Из брифа</option>
              </select>
              <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Без проекта</option>
                {projects.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
              </select>
              <textarea placeholder="Заметки" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                  {editingItem ? 'Сохранить' : 'Создать'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Automation Modal */}
      {showAutomation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-2">🤖 AI-автоматизация контента</h2>
            <p className="text-sm text-gray-500 mb-4">
              Система проанализирует вашу аудиторию и сгенерирует идеи для контента.
              Задачи будут созданы автоматически с пометкой "AI".
            </p>
            <div className="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-100">
              <p className="text-sm text-indigo-800 font-medium mb-2">Что будет создано:</p>
              <ul className="text-xs text-indigo-700 space-y-1">
                <li>• 2 AI-сгенерированных поста на ближайшие дни</li>
                <li>• Задачи с пометкой 🤖 AI</li>
                <li>• Автоматическое добавление в календарь</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateAISuggestions}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                🚀 Сгенерировать
              </button>
              <button
                onClick={() => setShowAutomation(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
