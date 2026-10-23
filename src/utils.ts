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
