import { DateRange, DateRangeState } from '../utils';

interface DateRangeSelectorProps {
  state: DateRangeState;
  onChange: (state: DateRangeState) => void;
}

const rangeOptions: { value: DateRange; label: string; icon: string }[] = [
  { value: 'day', label: 'День', icon: '📅' },
  { value: 'week', label: 'Неделя', icon: '📆' },
  { value: 'month', label: 'Месяц', icon: '🗓️' },
  { value: 'year', label: 'Год', icon: '📊' },
  { value: 'custom', label: 'Период', icon: '⚙️' },
];

export default function DateRangeSelector({ state, onChange }: DateRangeSelectorProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Период:</span>
        <div className="flex flex-wrap gap-1">
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...state, range: opt.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                state.range === opt.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
        {state.range === 'custom' && (
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={state.startDate}
              onChange={(e) => onChange({ ...state, startDate: e.target.value })}
              className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <span className="text-gray-400 text-xs">—</span>
            <input
              type="date"
              value={state.endDate}
              onChange={(e) => onChange({ ...state, endDate: e.target.value })}
              className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        )}
      </div>
    </div>
  );
}
