import { Client, Project, Transaction } from '../types';

interface DashboardProps {
  clients: Client[];
  projects: Project[];
  transactions: Transaction[];
}

export default function Dashboard({ clients, projects, transactions }: DashboardProps) {
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const activeProjects = projects.filter((p) => p.status === 'in-progress').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpense;

  const pendingBudget = projects
    .filter((p) => p.status !== 'completed')
    .reduce((sum, p) => sum + p.budget, 0);

  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const upcomingProjects = projects
    .filter((p) => p.status !== 'completed')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 4);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать 👋</h1>
        <p className="text-gray-500 mt-1">Вот обзор вашего бизнеса на сегодня</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="👥"
          label="Активные клиенты"
          value={activeClients.toString()}
          color="bg-blue-50 border-blue-100"
        />
        <StatCard
          icon="📁"
          label="Активные проекты"
          value={activeProjects.toString()}
          color="bg-purple-50 border-purple-100"
        />
        <StatCard
          icon="💰"
          label="Прибыль"
          value={formatMoney(profit)}
          color="bg-green-50 border-green-100"
        />
        <StatCard
          icon="📈"
          label="Ожидаемый доход"
          value={formatMoney(pendingBudget)}
          color="bg-amber-50 border-amber-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Последние транзакции</h2>
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    t.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {t.type === 'income' ? '📈' : '📉'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.description}</p>
                    <p className="text-xs text-gray-500">{t.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  t.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                </span>
              </div>
            ))}
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
            <StatusBar
              label="Бэклог"
              count={projects.filter((p) => p.status === 'backlog').length}
              total={projects.length}
              color="bg-gray-400"
            />
            <StatusBar
              label="В работе"
              count={projects.filter((p) => p.status === 'in-progress').length}
              total={projects.length}
              color="bg-blue-500"
            />
            <StatusBar
              label="На проверке"
              count={projects.filter((p) => p.status === 'review').length}
              total={projects.length}
              color="bg-amber-500"
            />
            <StatusBar
              label="Завершено"
              count={completedProjects}
              total={projects.length}
              color="bg-green-500"
            />
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
              <p className="text-xs text-gray-500 mt-1">Доход</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{formatMoney(totalExpense)}</p>
              <p className="text-xs text-gray-500 mt-1">Расход</p>
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

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}
