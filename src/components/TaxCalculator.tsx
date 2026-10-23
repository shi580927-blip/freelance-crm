import { useState, useMemo } from 'react';
import { Transaction, TaxSettings, TaxSystem } from '../types';
import { formatMoney, calculateTaxes } from '../utils';

interface TaxCalculatorProps {
  transactions: Transaction[];
  settings: TaxSettings;
  onUpdateSettings: (settings: TaxSettings) => void;
}

export default function TaxCalculator({ transactions, settings, onUpdateSettings }: TaxCalculatorProps) {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');

  const taxSystems: { value: TaxSystem; label: string; description: string; defaultRate: number }[] = [
    { value: 'usn6', label: 'УСН 6%', description: 'С доходов', defaultRate: 6 },
    { value: 'usn15', label: 'УСН 15%', description: 'Доходы минус расходы', defaultRate: 15 },
    { value: 'npd', label: 'НПД', description: 'Самозанятые', defaultRate: 6 },
    { value: 'osno', label: 'ОСНО', description: 'Общая система (НДФЛ 13%)', defaultRate: 13 },
    { value: 'patent', label: 'Патент', description: 'Фиксированная сумма', defaultRate: 0 },
  ];

  const calculations = useMemo(
    () => calculateTaxes(transactions, settings, period),
    [transactions, settings, period]
  );

  const totalIncome = calculations.reduce((sum, c) => sum + c.income, 0);
  const totalExpense = calculations.reduce((sum, c) => sum + c.expense, 0);
  const totalTax = calculations.reduce((sum, c) => sum + c.tax, 0);
  const totalContributions = calculations.reduce((sum, c) => sum + c.contributions, 0);
  const totalPayment = calculations.reduce((sum, c) => sum + c.total, 0);

  const handleSystemChange = (system: TaxSystem) => {
    const ts = taxSystems.find((t) => t.value === system);
    onUpdateSettings({
      ...settings,
      system,
      rate: ts?.defaultRate || settings.rate,
    });
  };

  const maxPayment = Math.max(...calculations.map((c) => c.total), 1);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Налоги и платежи</h1>
        <p className="text-gray-500 mt-1">Расчёт налогов и страховых взносов</p>
      </div>

      {/* Tax System Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Система налогообложения</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {taxSystems.map((ts) => (
            <button
              key={ts.value}
              onClick={() => handleSystemChange(ts.value)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                settings.system === ts.value
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <p className="text-sm font-medium">{ts.label}</p>
              <p className={`text-xs mt-0.5 ${settings.system === ts.value ? 'text-gray-300' : 'text-gray-500'}`}>
                {ts.description}
              </p>
            </button>
          ))}
        </div>

        {/* Rate Configuration */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Ставка налога (%)</label>
            <input
              type="number"
              value={settings.rate}
              onChange={(e) => onUpdateSettings({ ...settings, rate: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Фиксированные взносы в год (₽)</label>
            <input
              type="number"
              value={settings.fixedContributions}
              onChange={(e) => onUpdateSettings({ ...settings, fixedContributions: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              min="0"
            />
            <p className="text-xs text-gray-400 mt-1">Страховые взносы ИП (фиксированная часть)</p>
          </div>
          {settings.system === 'usn15' && (
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Учёт расходов</label>
              <p className="text-xs text-gray-500">Налог рассчитывается как (Доходы - Расходы) × {settings.rate}%</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="taxEnabled"
              checked={settings.enabled}
              onChange={(e) => onUpdateSettings({ ...settings, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="taxEnabled" className="text-sm text-gray-600">Включить расчёт</label>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'month', label: '📅 По месяцам' },
          { value: 'quarter', label: '📊 По кварталам' },
          { value: 'year', label: '📈 За год' },
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value as typeof period)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === p.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 rounded-xl border border-green-100 p-5">
          <p className="text-sm text-green-600 font-medium">Доход за год</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatMoney(totalIncome)}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-5">
          <p className="text-sm text-red-600 font-medium">Расход за год</p>
          <p className="text-xl font-bold text-red-700 mt-1">{formatMoney(totalExpense)}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
          <p className="text-sm text-amber-600 font-medium">Налог к уплате</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{formatMoney(totalTax)}</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-100 p-5">
          <p className="text-sm text-purple-600 font-medium">Всего платежи</p>
          <p className="text-xl font-bold text-purple-700 mt-1">{formatMoney(totalPayment)}</p>
          <p className="text-xs text-purple-500 mt-1">Налог + взносы</p>
        </div>
      </div>

      {/* Detailed Calculations */}
      {calculations.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Период</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Доходы</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Расходы</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Налог</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Взносы</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Итого</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calculations.map((c) => (
                <tr key={c.period} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-800">{c.period}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">
                    {formatMoney(c.income)}
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600 text-right">
                    {formatMoney(c.expense)}
                  </td>
                  <td className="px-6 py-4 text-sm text-amber-600 text-right font-medium">
                    {formatMoney(c.tax)}
                  </td>
                  <td className="px-6 py-4 text-sm text-purple-600 text-right">
                    {formatMoney(c.contributions)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm font-bold text-gray-800">{formatMoney(c.total)}</span>
                      <div className="w-20 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(c.total / maxPayment) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-800">ИТОГО</span>
                </td>
                <td className="px-6 py-4 text-sm text-green-600 text-right font-bold">
                  {formatMoney(totalIncome)}
                </td>
                <td className="px-6 py-4 text-sm text-red-600 text-right font-bold">
                  {formatMoney(totalExpense)}
                </td>
                <td className="px-6 py-4 text-sm text-amber-600 text-right font-bold">
                  {formatMoney(totalTax)}
                </td>
                <td className="px-6 py-4 text-sm text-purple-600 text-right font-bold">
                  {formatMoney(totalContributions)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-gray-900">{formatMoney(totalPayment)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🧾</p>
          <p className="text-lg text-gray-600">Расчёт налогов не активирован</p>
          <p className="text-sm text-gray-400 mt-1">Включите расчёт и настройте систему налогообложения</p>
        </div>
      )}

      {/* Tax Schedule */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📅 График платежей</h2>
        <div className="space-y-3">
          {settings.system === 'usn6' || settings.system === 'usn15' ? (
            <>
              <PaymentRow date="28 апреля" label="Авансовый платёж УСН за Q1" amount={calculations[0]?.total || 0} />
              <PaymentRow date="28 июля" label="Авансовый платёж УСН за Q2" amount={calculations[1]?.total || 0} />
              <PaymentRow date="28 октября" label="Авансовый платёж УСН за Q3" amount={calculations[2]?.total || 0} />
              <PaymentRow date="30 апреля (след. год)" label="Итоговый платёж за год" amount={calculations[3]?.total || 0} />
            </>
          ) : settings.system === 'npd' ? (
            <PaymentRow date="25 число каждого месяца" label="Ежемесячный платёж НПД" amount={totalTax / 12} />
          ) : (
            <PaymentRow date="По графику" label="Платежи согласно системе" amount={totalPayment} />
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentRow({ date, label, amount }: { date: string; label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-sm">📅</span>
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>
      <span className="text-sm font-bold text-gray-800">{formatMoney(amount)}</span>
    </div>
  );
}
