import { useState, useMemo } from 'react';
import { Transaction, Project, Client, FinanceGroupBy } from '../types';
import { generateId } from '../data';
import { formatMoney, DateRangeState, getDateRange, isDateInRange, groupTransactions } from '../utils';
import DateRangeSelector from './DateRangeSelector';

interface FinancesProps {
  transactions: Transaction[];
  projects: Project[];
  clients: Client[];
  onUpdate: (transactions: Transaction[]) => void;
}

export default function Finances({ transactions, projects, clients, onUpdate }: FinancesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [groupBy, setGroupBy] = useState<FinanceGroupBy>('month');
  const [dateRange, setDateRange] = useState<DateRangeState>({
    range: 'year',
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
  });

  const range = useMemo(() => getDateRange(dateRange), [dateRange]);

  const [form, setForm] = useState({
    type: 'income' as Transaction['type'],
    category: '',
    amount: 0,
    description: '',
    projectId: '',
    clientId: '',
    date: '',
  });

  // Filter by date range and type
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => isDateInRange(t.date, range))
      .filter((t) => filter === 'all' || t.type === filter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, range, filter]);

  const periodTransactions = useMemo(
    () => transactions.filter((t) => isDateInRange(t.date, range)),
    [transactions, range]
  );

  const totalIncome = periodTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = periodTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpense;

  // Grouped data for chart
  const groupedData = useMemo(
    () => groupTransactions(periodTransactions, groupBy),
    [periodTransactions, groupBy]
  );

  const maxGroupValue = Math.max(...groupedData.map((g) => Math.max(g.income, g.expense)), 1);

  const categories = ['Проект', 'Подписки', 'Оборудование', 'Обучение', 'Налоги', 'Маркетинг', 'Другое'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      onUpdate(transactions.map((t) => t.id === editingTransaction.id ? { ...t, ...form } : t));
    } else {
      const newTransaction: Transaction = { id: generateId(), ...form };
      onUpdate([...transactions, newTransaction]);
    }
    resetForm();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setForm({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      projectId: transaction.projectId || '',
      clientId: transaction.clientId || '',
      date: transaction.date,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(transactions.filter((t) => t.id !== id));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
    setForm({ type: 'income', category: '', amount: 0, description: '', projectId: '', clientId: '', date: '' });
  };

  // Expense by category
  const expenseByCategory = periodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const maxExpense = Math.max(...Object.values(expenseByCategory), 1);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Финансы</h1>
          <p className="text-gray-500 mt-1">Учёт доходов и расходов с группировкой</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + Добавить транзакцию
        </button>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector state={dateRange} onChange={setDateRange} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-5">
          <p className="text-sm text-green-600 font-medium">Доходы за период</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{formatMoney(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100 p-5">
          <p className="text-sm text-red-600 font-medium">Расходы за период</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{formatMoney(totalExpense)}</p>
        </div>
        <div className={`rounded-xl border p-5 ${profit >= 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'}`}>
          <p className={`text-sm font-medium ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>Прибыль</p>
          <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{formatMoney(profit)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-5">
          <p className="text-sm text-purple-600 font-medium">Транзакций</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{periodTransactions.length}</p>
        </div>
      </div>

      {/* Grouping Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Статистика по периодам</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: 'day', label: 'Дни' },
              { value: 'week', label: 'Недели' },
              { value: 'month', label: 'Месяцы' },
              { value: 'year', label: 'Годы' },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => setGroupBy(g.value as FinanceGroupBy)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  groupBy === g.value ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {groupedData.length > 0 ? (
          <>
            {/* Bar Chart */}
            <div className="flex items-end gap-2 h-48 mb-4">
              {groupedData.map((g) => (
                <div key={g.key} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5" style={{ height: '160px', alignItems: 'flex-end' }}>
                    <div
                      className="flex-1 bg-green-400 rounded-t-sm transition-all hover:bg-green-500"
                      style={{ height: `${(g.income / maxGroupValue) * 100}%`, minHeight: g.income > 0 ? '4px' : '0' }}
                      title={`Доход: ${formatMoney(g.income)}`}
                    />
                    <div
                      className="flex-1 bg-red-400 rounded-t-sm transition-all hover:bg-red-500"
                      style={{ height: `${(g.expense / maxGroupValue) * 100}%`, minHeight: g.expense > 0 ? '4px' : '0' }}
                      title={`Расход: ${formatMoney(g.expense)}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 text-center truncate w-full">{g.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded-sm" />
                <span className="text-xs text-gray-500">Доходы</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded-sm" />
                <span className="text-xs text-gray-500">Расходы</span>
              </div>
            </div>

            {/* Grouped Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-medium text-gray-500">Период</th>
                    <th className="text-right py-2 text-xs font-medium text-gray-500">Доходы</th>
                    <th className="text-right py-2 text-xs font-medium text-gray-500">Расходы</th>
                    <th className="text-right py-2 text-xs font-medium text-gray-500">Прибыль</th>
                    <th className="text-right py-2 text-xs font-medium text-gray-500">Кол-во</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groupedData.map((g) => (
                    <tr key={g.key} className="hover:bg-gray-50">
                      <td className="py-2 font-medium text-gray-800">{g.label}</td>
                      <td className="py-2 text-right text-green-600">{formatMoney(g.income)}</td>
                      <td className="py-2 text-right text-red-600">{formatMoney(g.expense)}</td>
                      <td className={`py-2 text-right font-medium ${g.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatMoney(g.profit)}
                      </td>
                      <td className="py-2 text-right text-gray-500">{g.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Нет данных за выбранный период</p>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Расходы по категориям</h2>
        <div className="space-y-3">
          {Object.keys(expenseByCategory).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Нет расходов за период</p>
          ) : (
            Object.entries(expenseByCategory).map(([category, amount]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{category}</span>
                  <span className="text-gray-800 font-medium">{formatMoney(amount)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full transition-all" style={{ width: `${(amount / maxExpense) * 100}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[
          { value: 'all', label: 'Все' },
          { value: 'income', label: '📈 Доходы' },
          { value: 'expense', label: '📉 Расходы' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">
          {filteredTransactions.length} транзакций
        </span>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Тип</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Описание</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Источник</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Сумма</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {t.type === 'income' ? '📈' : '📉'} {t.type === 'income' ? 'Доход' : 'Расход'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">{t.description}</p>
                  <p className="text-xs text-gray-400">{t.category}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    t.source === 'auto' ? 'bg-cyan-100 text-cyan-700' :
                    t.source === 'import' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {t.source === 'auto' ? '⚙️ Авто' : t.source === 'import' ? '📥 Импорт' : '✍️ Вручную'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                <td className={`px-6 py-4 text-sm font-semibold text-right ${
                  t.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-gray-700 mr-3 text-sm">✏️</button>
                  <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-600 text-sm">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Транзакций нет</p>
          </div>
        )}
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingTransaction ? 'Редактировать' : 'Новая транзакция'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm({ ...form, type: 'income' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${form.type === 'income' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                  📈 Доход
                </button>
                <button type="button" onClick={() => setForm({ ...form, type: 'expense' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${form.type === 'expense' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                  📉 Расход
                </button>
              </div>
              <input type="text" placeholder="Описание *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Категория *</option>
                {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <input type="number" placeholder="Сумма (₽) *" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required min="1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Привязать к проекту</option>
                {projects.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
              </select>
              <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Привязать к клиенту</option>
                {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                  {editingTransaction ? 'Сохранить' : 'Создать'}
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
