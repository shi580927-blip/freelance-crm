import { useState, useMemo } from 'react';
import { Project, Task, ContentItem, Reminder } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, daysUntil, isToday, isPast, addDays } from '../utils';

interface CalendarProps {
  projects: Project[];
  tasks: Task[];
  content: ContentItem[];
  reminders: Reminder[];
  onUpdateReminders: (reminders: Reminder[]) => void;
}

type ViewMode = 'month' | 'upcoming';

export default function Calendar({ projects, tasks, content, reminders, onUpdateReminders }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Get events for a specific date
  const getEventsForDate = (dateStr: string) => {
    const events: { id: string; title: string; type: 'project' | 'task' | 'content'; color: string; priority?: string }[] = [];

    projects.forEach((p) => {
      if (p.deadline === dateStr) {
        events.push({ id: p.id, title: p.title, type: 'project', color: 'bg-blue-500', priority: p.priority });
      }
    });

    tasks.forEach((t) => {
      if (t.dueDate === dateStr) {
        events.push({ id: t.id, title: t.title, type: 'task', color: 'bg-purple-500', priority: t.priority });
      }
    });

    content.forEach((c) => {
      if (c.scheduledDate === dateStr) {
        events.push({ id: c.id, title: c.title, type: 'content', color: 'bg-pink-500' });
      }
    });

    return events;
  };

  // Upcoming reminders
  const upcomingReminders = useMemo(() => {
    return reminders
      .filter((r) => !r.done)
      .map((r) => ({ ...r, daysLeft: daysUntil(r.date) }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [reminders]);

  // Selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const toggleReminder = (id: string) => {
    onUpdateReminders(reminders.map((r) => r.id === id ? { ...r, done: !r.done } : r));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Календарь</h1>
          <p className="text-gray-500 mt-1">Дедлайны, задачи и напоминания</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
          >
            📅 Месяц
          </button>
          <button
            onClick={() => setViewMode('upcoming')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'upcoming' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
          >
            🔔 Напоминания
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
              <h2 className="text-lg font-semibold text-gray-800">{monthNames[month]} {year}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">→</button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const events = getEventsForDate(dateStr);
                const isCurrentDay = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const isPastDay = dateStr < today;

                // Map event colors to background colors
                const getBgColor = (colorClass: string) => {
                  if (colorClass.includes('blue')) return 'bg-blue-200';
                  if (colorClass.includes('purple')) return 'bg-purple-200';
                  if (colorClass.includes('pink')) return 'bg-pink-200';
                  return 'bg-gray-200';
                };

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-colors border relative overflow-hidden ${
                      isSelected
                        ? 'border-blue-400 ring-2 ring-blue-200'
                        : isCurrentDay
                        ? 'border-blue-200'
                        : 'border-transparent hover:border-gray-300'
                    } ${isPastDay ? 'opacity-60' : ''}`}
                  >
                    {/* Background color blocks for multiple events */}
                    {events.length > 1 && (
                      <div className="absolute inset-0 flex">
                        {events.slice(0, 4).map((e) => (
                          <div
                            key={e.id}
                            className={`flex-1 ${getBgColor(e.color)}`}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Single event - full background */}
                    {events.length === 1 && (
                      <div className={`absolute inset-0 ${getBgColor(events[0].color)} rounded-lg`} />
                    )}
                    
                    {/* Day number */}
                    <span className={`relative z-10 text-xs font-medium ${
                      isCurrentDay ? 'text-blue-600 font-bold' : 'text-gray-700'
                    }`}>
                      {day}
                    </span>
                    
                    {/* Event count badge for multiple events */}
                    {events.length > 1 && (
                      <span className="relative z-10 text-[9px] font-bold text-gray-700 mt-0.5 bg-white/70 px-1 rounded">
                        {events.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500">Проекты</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-xs text-gray-500">Задачи</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span className="text-xs text-gray-500">Контент</span>
              </div>
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : 'Выберите день'}
            </h3>
            {selectedDate && selectedDateEvents.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Нет событий на этот день</p>
            )}
            <div className="space-y-2">
              {selectedDateEvents.map((e) => (
                <div key={e.id} className={`p-3 rounded-lg border-l-4 ${
                  e.type === 'project' ? 'border-blue-400 bg-blue-50' :
                  e.type === 'task' ? 'border-purple-400 bg-purple-50' :
                  'border-pink-400 bg-pink-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {e.type === 'project' ? '📁' : e.type === 'task' ? '✅' : '📝'}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{e.title}</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {e.type === 'project' ? 'Проект' : e.type === 'task' ? 'Задача' : 'Контент'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Upcoming Reminders View */
        <div className="space-y-3">
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-lg">Нет активных напоминаний</p>
            </div>
          ) : (
            upcomingReminders.map((r) => {
              const isOverdue = r.daysLeft < 0;
              const isUrgent = r.daysLeft >= 0 && r.daysLeft <= r.daysBefore;
              const isSoon = r.daysLeft > r.daysBefore && r.daysLeft <= 7;

              return (
                <div
                  key={r.id}
                  className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${
                    isOverdue ? 'border-red-300 bg-red-50' :
                    isUrgent ? 'border-amber-300 bg-amber-50' :
                    isSoon ? 'border-blue-200' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => toggleReminder(r.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      r.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {r.done && '✓'}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${r.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {r.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">📅 {r.date}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isOverdue ? 'bg-red-100 text-red-700' :
                        isUrgent ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {isOverdue ? `Просрочено на ${Math.abs(r.daysLeft)} дн.` :
                         r.daysLeft === 0 ? 'Сегодня' :
                         r.daysLeft === 1 ? 'Завтра' :
                         `Через ${r.daysLeft} дн.`}
                      </span>
                      <span className="text-xs text-gray-400">⏰ Напомнить за {r.daysBefore} дн.</span>
                    </div>
                  </div>
                  <span className={`text-lg ${
                    r.type === 'deadline' ? '' : r.type === 'payment' ? '' : r.type === 'tax' ? '' : r.type === 'content' ? '' : ''
                  }`}>
                    {r.type === 'deadline' ? '📁' : r.type === 'payment' ? '💰' : r.type === 'tax' ? '🧾' : r.type === 'content' ? '📝' : '🔔'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
