import { useState, useMemo } from 'react';
import { Client, Project, Transaction, Reminder } from '../types';
import { formatMoney, DateRangeState, getDateRange, isDateInRange, daysUntil } from '../utils';
import DateRangeSelector from './DateRangeSelector';

interface DashboardProps {
  clients: Client[];
  projects: Project[];
  transactions: Transaction[];
  reminders: Reminder[];
}

export default function Dashboard({ clients, projects, transactions, reminders }: DashboardProps) {
  const [dateRange, setDateRange] = useState<DateRangeState>({
    range: 'month',
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
  });

  const range = useMemo(() => getDateRange(dateRange), [dateRange]);

  // Filtered transactions by date range
  const filteredTransactions = useMemo(
    () => transactions.filter((t) => isDateInRange(t.date, range)),
    [transactions, range]
  );

  const activeClients = clients.filter((c) => c.status === 'active').length;
  const activeProjects = projects.filter((p) => p.status === 'in-progress').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpense;

  const pendingBudget = projects
    .filter((p) => p.status !== 'completed')
    .reduce((sum, p) => sum + p.budget, 0);

  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const upcomingProjects = projects
    .filter((p) => p.status !== 'completed')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 4);

  // Chart data: group transactions by date
  const chartData = useMemo(() => {
    const incomeByDate: Record<string, number> = {};
    const expenseByDate: Record<string, number> = {};

    filteredTransactions.forEach((t) => {
      if (t.type === 'income') {
        incomeByDate[t.date] = (incomeByDate[t.date] || 0) + t.amount;
      } else {
        expenseByDate[t.date] = (expenseByDate[t.date] || 0) + t.amount;
      }
    });

    const allDates = [...new Set([...Object.keys(incomeByDate), ...Object.keys(expenseByDate)])].sort();
    return allDates.map((date) => ({
      date,
      income: incomeByDate[date] || 0,
      expense: expenseByDate[date] || 0,
    }));
  }, [filteredTransactions]);

  const maxChartValue = Math.max(...chartData.map((d) => Math.max(d.income, d.expense)), 1);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать 👋</h1>
        <p className="text-gray-500 mt-1">Вот обзор вашего бизнеса</p>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector state={dateRange} onChange={setDateRange} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👥" label="Активные клиенты" value={activeClients.toString()} color="bg-blue-50 border-blue-100" />
        <StatCard icon="📁" label="Активные проекты" value={activeProjects.toString()} color="bg-purple-50 border-purple-100" />
        <StatCard icon="💰" label="Прибыль за период" value={formatMoney(profit)} color="bg-green-50 border-green-100" />
        <StatCard icon="📈" label="Ожидаемый доход" value={formatMoney(pendingBudget)} color="bg-amber-50 border-amber-100" />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Динамика финансов</h2>
          <div className="flex items-end gap-1 h-40">
            {chartData.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '120px' }}>
                  <div
                    className="w-full bg-green-400 rounded-t-sm"
                    style={{ height: `${(d.income / maxChartValue) * 100}%`, minHeight: d.income > 0 ? '2px' : '0' }}
                    title={`Доход: ${formatMoney(d.income)}`}
                  />
                  <div
                    className="w-full bg-red-400 rounded-b-sm"
                    style={{ height: `${(d.expense / maxChartValue) * 100}%`, minHeight: d.expense > 0 ? '2px' : '0' }}
                    title={`Расход: ${formatMoney(d.expense)}`}
                  />
                </div>
                <span className="text-[9px] text-gray-400 truncate w-full text-center">
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 rounded-sm" />
              <span className="text-xs text-gray-500">Доходы</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-400 rounded-sm" />
              <span className="text-xs text-gray-500">Расходы</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Reminders */}
      {reminders.filter(r => !r.done && daysUntil(r.date) <= 7).length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-6">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">🔔 Ближайшие напоминания</h3>
          <div className="space-y-1">
            {reminders
              .filter(r => !r.done && daysUntil(r.date) <= 7)
              .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
              .slice(0, 3)
              .map((r) => {
                const days = daysUntil(r.date);
                return (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-amber-800">{r.title}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      days < 0 ? 'bg-red-100 text-red-700' :
                      days === 0 ? 'bg-amber-200 text-amber-800' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {days < 0 ? `Просрочено` : days === 0 ? 'Сегодня' : `Через ${days} дн.`}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Последние транзакции</h2>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Нет транзакций за выбранный период</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {t.type === 'income' ? '📈' : '📉'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.description}</p>
                      <p className="text-xs text-gray-500">{t.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Projects */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ближайшие дедлайны</h2>
          <div className="space-y-3">
            {upcomingProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={p.priority} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-500">
                      {clients.find((c) => c.id === p.clientId)?.company || 'Клиент'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{p.deadline}</p>
                  <p className="text-xs text-gray-500">{formatMoney(p.budget)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Status Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Статус проектов</h2>
          <div className="space-y-4">
            <StatusBar label="Бэклог" count={projects.filter((p) => p.status === 'backlog').length} total={projects.length} color="bg-gray-400" />
            <StatusBar label="В работе" count={projects.filter((p) => p.status === 'in-progress').length} total={projects.length} color="bg-blue-500" />
            <StatusBar label="На проверке" count={projects.filter((p) => p.status === 'review').length} total={projects.length} color="bg-amber-500" />
            <StatusBar label="Завершено" count={completedProjects} total={projects.length} color="bg-green-500" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Быстрая статистика</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{completedProjects}</p>
              <p className="text-xs text-gray-500 mt-1">Завершено</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{clients.filter(c => c.status === 'lead').length}</p>
              <p className="text-xs text-gray-500 mt-1">Лидов</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{formatMoney(totalIncome)}</p>
              <p className="text-xs text-gray-500 mt-1">Доход за период</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{formatMoney(totalExpense)}</p>
              <p className="text-xs text-gray-500 mt-1">Расход за период</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-800 font-medium">{count}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-green-100 text-green-700',
  };
  const labels: Record<string, string> = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[priority]}`}>
      {labels[priority]}
    </span>
  );
}
