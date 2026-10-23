import { FinanceGroupBy, TaxSettings, Transaction } from './types';

export type DateRange = 'day' | 'week' | 'month' | 'year' | 'custom';

export interface DateRangeState {
  range: DateRange;
  startDate: string;
  endDate: string;
}

export function getDateRange(state: DateRangeState): { start: string; end: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (state.range) {
    case 'day':
      return { start: today, end: today };
    case 'week': {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { start: start.toISOString().split('T')[0], end: today };
    }
    case 'month': {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      return { start: start.toISOString().split('T')[0], end: today };
    }
    case 'year': {
      const start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      return { start: start.toISOString().split('T')[0], end: today };
    }
    case 'custom':
      return { start: state.startDate, end: state.endDate };
    default:
      return { start: '', end: today };
  }
}

export function isDateInRange(date: string, range: { start: string; end: string }): boolean {
  if (!range.start || !range.end) return true;
  return date >= range.start && date <= range.end;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatShortDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// Get the start of a group period for a date
export function getGroupKey(date: string, groupBy: FinanceGroupBy): string {
  const d = new Date(date);
  switch (groupBy) {
    case 'day':
      return date;
    case 'week': {
      const start = new Date(d);
      start.setDate(start.getDate() - start.getDay() + 1);
      return start.toISOString().split('T')[0];
    }
    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    case 'year':
      return `${d.getFullYear()}`;
    default:
      return date;
  }
}

export function getGroupLabel(key: string, groupBy: FinanceGroupBy): string {
  switch (groupBy) {
    case 'day':
      return formatShortDate(key);
    case 'week':
      return `Неделя ${formatShortDate(key)}`;
    case 'month': {
      const [year, month] = key.split('-');
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      return `${months[parseInt(month) - 1]} ${year}`;
    }
    case 'year':
      return `${key} год`;
    default:
      return key;
  }
}

// Group transactions
export interface FinanceGroup {
  key: string;
  label: string;
  income: number;
  expense: number;
  profit: number;
  count: number;
}

export function groupTransactions(transactions: Transaction[], groupBy: FinanceGroupBy): FinanceGroup[] {
  const groups: Record<string, FinanceGroup> = {};

  transactions.forEach((t) => {
    const key = getGroupKey(t.date, groupBy);
    if (!groups[key]) {
      groups[key] = { key, label: getGroupLabel(key, groupBy), income: 0, expense: 0, profit: 0, count: 0 };
    }
    if (t.type === 'income') groups[key].income += t.amount;
    else groups[key].expense += t.amount;
    groups[key].count += 1;
  });

  Object.values(groups).forEach((g) => {
    g.profit = g.income - g.expense;
  });

  return Object.values(groups).sort((a, b) => a.key.localeCompare(b.key));
}

// Tax calculations
export interface TaxCalculation {
  period: string;
  income: number;
  expense: number;
  taxBase: number;
  tax: number;
  contributions: number;
  total: number;
}

export function calculateTaxes(
  transactions: Transaction[],
  settings: TaxSettings,
  period: 'month' | 'quarter' | 'year'
): TaxCalculation[] {
  if (!settings.enabled) return [];

  const results: TaxCalculation[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();

  let periods: { label: string; start: string; end: string }[] = [];

  if (period === 'month') {
    for (let m = 0; m < 12; m++) {
      const start = new Date(currentYear, m, 1).toISOString().split('T')[0];
      const end = new Date(currentYear, m + 1, 0).toISOString().split('T')[0];
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      periods.push({ label: months[m], start, end });
    }
  } else if (period === 'quarter') {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    for (let q = 0; q < 4; q++) {
      const startMonth = q * 3;
      const start = new Date(currentYear, startMonth, 1).toISOString().split('T')[0];
      const end = new Date(currentYear, startMonth + 3, 0).toISOString().split('T')[0];
      periods.push({ label: quarters[q], start, end });
    }
  } else {
    periods = [{ label: `${currentYear}`, start: `${currentYear}-01-01`, end: `${currentYear}-12-31` }];
  }

  periods.forEach((p) => {
    const periodTransactions = transactions.filter(
      (t) => t.date >= p.start && t.date <= p.end
    );

    const income = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    let taxBase = income;
    let tax = 0;

    switch (settings.system) {
      case 'usn6':
        taxBase = income;
        tax = Math.round(income * (settings.rate / 100));
        break;
      case 'usn15':
        taxBase = Math.max(income - expense, 0);
        tax = Math.round(taxBase * (settings.rate / 100));
        break;
      case 'npd':
        taxBase = income;
        tax = Math.round(income * (settings.rate / 100));
        break;
      case 'osno':
        taxBase = Math.max(income - expense, 0);
        tax = Math.round(taxBase * 0.13); // НДФЛ
        break;
      case 'patent':
        tax = Math.round(settings.rate * 1000); // фиксированная сумма
        break;
    }

    // Вычет страховых взносов для УСН и НПД
    const contributions = settings.fixedContributions / (period === 'month' ? 12 : period === 'quarter' ? 4 : 1);
    if (settings.system === 'usn6' || settings.system === 'npd') {
      tax = Math.max(tax - contributions, 0);
    }

    results.push({
      period: p.label,
      income,
      expense,
      taxBase,
      tax,
      contributions: Math.round(contributions),
      total: tax + Math.round(contributions),
    });
  });

  return results;
}

// Calendar helpers
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday start
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function daysUntil(date: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isToday(date: string): boolean {
  return date === new Date().toISOString().split('T')[0];
}

export function isPast(date: string): boolean {
  return date < new Date().toISOString().split('T')[0];
}
