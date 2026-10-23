import { useState, useEffect, useCallback } from 'react';
import { Page, Client, Project, Task, Transaction, ContentItem, TaxSettings, Reminder } from './types';
import {
  loadData,
  loadSingle,
  saveData,
  STORAGE_KEYS,
  initialClients,
  initialProjects,
  initialTasks,
  initialTransactions,
  initialContent,
  initialTaxSettings,
  initialReminders,
} from './data';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Finances from './components/Finances';
import Calendar from './components/Calendar';
import ContentPlan from './components/ContentPlan';
import TaxCalculator from './components/TaxCalculator';

interface NavParams {
  highlight?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [navParams, setNavParams] = useState<NavParams>({});

  // Data state
  const [clients, setClients] = useState<Client[]>(() => loadData<Client>(STORAGE_KEYS.clients, initialClients));
  const [projects, setProjects] = useState<Project[]>(() => loadData<Project>(STORAGE_KEYS.projects, initialProjects));
  const [tasks, setTasks] = useState<Task[]>(() => loadData<Task>(STORAGE_KEYS.tasks, initialTasks));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadData<Transaction>(STORAGE_KEYS.transactions, initialTransactions));
  const [content, setContent] = useState<ContentItem[]>(() => loadData<ContentItem>(STORAGE_KEYS.content, initialContent));
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(() => loadSingle<TaxSettings>(STORAGE_KEYS.taxSettings, initialTaxSettings));
  const [reminders, setReminders] = useState<Reminder[]>(() => loadData<Reminder>(STORAGE_KEYS.reminders, initialReminders));

  // Persist data
  useEffect(() => { saveData(STORAGE_KEYS.clients, clients); }, [clients]);
  useEffect(() => { saveData(STORAGE_KEYS.projects, projects); }, [projects]);
  useEffect(() => { saveData(STORAGE_KEYS.tasks, tasks); }, [tasks]);
  useEffect(() => { saveData(STORAGE_KEYS.transactions, transactions); }, [transactions]);
  useEffect(() => { saveData(STORAGE_KEYS.content, content); }, [content]);
  useEffect(() => { saveData(STORAGE_KEYS.taxSettings, taxSettings); }, [taxSettings]);
  useEffect(() => { saveData(STORAGE_KEYS.reminders, reminders); }, [reminders]);

  const handleNavigate = useCallback((page: Page, params?: NavParams) => {
    setCurrentPage(page);
    setNavParams(params || {});
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard clients={clients} projects={projects} transactions={transactions} reminders={reminders} />;
      case 'clients':
        return <Clients clients={clients} projects={projects} onUpdate={setClients} highlightId={navParams.highlight} />;
      case 'projects':
        return <Projects projects={projects} clients={clients} onUpdate={setProjects} />;
      case 'tasks':
        return <Tasks tasks={tasks} projects={projects} clients={clients} onUpdate={setTasks} onNavigate={handleNavigate} />;
      case 'finances':
        return <Finances transactions={transactions} projects={projects} clients={clients} onUpdate={setTransactions} />;
      case 'calendar':
        return <Calendar projects={projects} tasks={tasks} content={content} reminders={reminders} onUpdateReminders={setReminders} />;
      case 'content':
        return <ContentPlan content={content} projects={projects} clients={clients} onUpdate={setContent} />;
      case 'taxes':
        return <TaxCalculator transactions={transactions} settings={taxSettings} onUpdateSettings={setTaxSettings} />;
      default:
        return <Dashboard clients={clients} projects={projects} transactions={transactions} reminders={reminders} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar currentPage={currentPage} onNavigate={(page) => handleNavigate(page)} isCollapsed={sidebarCollapsed} />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-8 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-gray-400 hover:text-gray-700 transition-colors">
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
              <input type="text" placeholder="Поиск..." className="bg-transparent text-sm text-gray-600 placeholder-gray-400 focus:outline-none w-32" />
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer">Я</div>
          </div>
        </div>
        <div className="pb-8">{renderPage()}</div>
      </main>
    </div>
  );
}
