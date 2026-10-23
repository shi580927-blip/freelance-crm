import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isCollapsed: boolean;
}

const navItems: { page: Page; icon: string; label: string; group?: string }[] = [
  { page: 'dashboard', icon: '📊', label: 'Дашборд' },
  { page: 'clients', icon: '👥', label: 'Клиенты' },
  { page: 'projects', icon: '📁', label: 'Проекты' },
  { page: 'tasks', icon: '✅', label: 'Задачи' },
  { page: 'calendar', icon: '📅', label: 'Календарь' },
  { page: 'content', icon: '📝', label: 'Контент-план' },
  { page: 'finances', icon: '💰', label: 'Финансы' },
  { page: 'taxes', icon: '🧾', label: 'Налоги' },
];

export default function Sidebar({ currentPage, onNavigate, isCollapsed }: SidebarProps) {
  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-[#fbfbfa] border-r border-gray-200 flex flex-col transition-all duration-300 h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            F
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-gray-800 text-lg">FreelanceCRM</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 mt-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mb-0.5 ${
              currentPage === item.page
                ? 'bg-gray-200/70 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              Я
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Фрилансер</p>
              <p className="text-xs text-gray-500">Pro план</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
