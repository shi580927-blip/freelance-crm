import { useState, useEffect, useCallback } from 'react';
import { Page, Client, Project, Task, Transaction } from './types';
import {
  loadData,
  saveData,
  STORAGE_KEYS,
  initialClients,
  initialProjects,
  initialTasks,
  initialTransactions,
} from './data';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Finances from './components/Finances';

interface NavParams {
  highlight?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [navParams, setNavParams] = useState<NavParams>({});

  // Data state
  const [clients, setClients] = useState<Client[]>(() =>
    loadData<Client>(STORAGE_KEYS.clients, initialClients)
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    loadData<Project>(STORAGE_KEYS.projects, initialProjects)
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadData<Task>(STORAGE_KEYS.tasks, initialTasks)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadData<Transaction>(STORAGE_KEYS.transactions, initialTransactions)
  );

  // Persist data to localStorage
  useEffect(() => { saveData(STORAGE_KEYS.clients, clients); }, [clients]);
  useEffect(() => { saveData(STORAGE_KEYS.projects, projects); }, [projects]);
  useEffect(() => { saveData(STORAGE_KEYS.tasks, tasks); }, [tasks]);
  useEffect(() => { saveData(STORAGE_KEYS.transactions, transactions); }, [transactions]);

  // Navigation handler
  const handleNavigate = useCallback((page: Page, params?: NavParams) => {
    setCurrentPage(page);
    setNavParams(params || {});
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard clients={clients} projects={projects} transactions={transactions} />;
      case 'clients':
        return (
          <Clients
            clients={clients}
            projects={projects}
            onUpdate={setClients}
            highlightId={navParams.highlight}
          />
        );
      case 'projects':
        return <Projects projects={projects} clients={clients} onUpdate={setProjects} />;
      case 'tasks':
        return (
          <Tasks
            tasks={tasks}
            projects={projects}
            clients={clients}
            onUpdate={setTasks}
            onNavigate={handleNavigate}
          />
        );
      case 'finances':
        return <Finances transactions={transactions} projects={projects} clients={clients} onUpdate={setTransactions} />;
      default:
        return <Dashboard clients={clients} projects={projects} transactions={transactions} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => handleNavigate(page)}
        isCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <circle cx="9" cy="9" r="7" />
                <path d="M14 14l4 4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Поиск..."
                className="bg-transparent text-sm text-gray-600 placeholder-gray-400 focus:outline-none w-32"
              />
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              Я
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="pb-8">{renderPage()}</div>
      </main>
    </div>
  );
}
