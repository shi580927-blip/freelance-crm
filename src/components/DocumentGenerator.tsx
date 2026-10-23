import { useState } from 'react';
import { Client, Project, Task } from '../types';
import { formatDate, formatMoney } from '../utils';

interface DocumentGeneratorProps {
  client: Client;
  project?: Project;
  task?: Task;
  onClose: () => void;
}

type DocType = 'act' | 'contract' | 'letter';

export default function DocumentGenerator({ client, project, task, onClose }: DocumentGeneratorProps) {
  const [docType, setDocType] = useState<DocType>('act');
  const [sent, setSent] = useState(false);

  const docTypes: { value: DocType; label: string; icon: string }[] = [
    { value: 'act', label: 'Акт выполненных работ', icon: '📄' },
    { value: 'contract', label: 'Договор', icon: '📋' },
    { value: 'letter', label: 'Письмо', icon: '✉️' },
  ];

  const generateContent = (): string => {
    const today = formatDate(new Date().toISOString().split('T')[0]);
    const projectName = project?.title || task ? 'Услуга' : '';
    const projectBudget = project?.budget || 0;

    switch (docType) {
      case 'act':
        return `АКТ ВЫПОЛНЕННЫХ РАБОТ №___

Дата: ${today}

Исполнитель: Фрилансер (ИП Иванов И.И.)
Заказчик: ${client.company} (${client.name})

Настоящий акт составлен о том, что Исполнителем были выполнены следующие работы для Заказчика:

${project ? `Проект: "${project.title}"\nОписание: ${project.description}` : 'Услуги по разработке программного обеспечения'}

${task ? `\nВыполненные задачи: ${task.title}` : ''}

Стоимость выполненных работ: ${formatMoney(projectBudget)}

Работы выполнены полностью и в срок. Заказчик претензий по объёму, качеству и срокам выполнения работ не имеет.

Исполнитель: _______________ /Фрилансер/
Заказчик: _______________ /${client.name}/
`;

      case 'contract':
        return `ДОГОВОР ПОДРЯДА №___

г. Москва                                    ${today}

${client.company} в лице ${client.name}, именуемый в дальнейшем "Заказчик", с одной стороны, и
Фрилансер (ИП Иванов И.И.), именуемый в дальнейшем "Исполнитель", с другой стороны, заключили настоящий договор о следующем:

1. ПРЕДМЕТ ДОГОВОРА
1.1. Исполнитель обязуется выполнить работы по проекту: "${project?.title || 'Разработка программного обеспечения'}"
1.2. ${project?.description || 'Техническое задание согласовывается сторонами отдельно.'}

2. СТОИМОСТЬ РАБОТ И ПОРЯДОК РАСЧЁТОВ
2.1. Стоимость работ по настоящему договору составляет: ${formatMoney(projectBudget)}
2.2. Оплата производится в следующем порядке:
    - 50% предоплата в течение 3 рабочих дней с момента подписания
    - 50% в течение 3 рабочих дней после подписания акта

3. СРОКИ ВЫПОЛНЕНИЯ
3.1. Срок начала работ: с момента подписания договора
3.2. Срок окончания работ: ${project?.deadline || 'согласовывается сторонами'}

4. ОТВЕТСТВЕННОСТЬ СТОРОН
4.1. В случае нарушения сроков Заказчик вправе потребовать неустойку в размере 0.1% за каждый день просрочки.

5. ПОДПИСИ СТОРОН

Исполнитель: _______________ /Фрилансер/
Заказчик: _______________ /${client.name}/
`;

      case 'letter':
        return `Уважаемый(ая) ${client.name}!

${today}

${project
  ? `Направляю Вам отчёт по проекту "${project.title}".

Статус проекта: ${
    project.status === 'completed'
      ? '✅ Завершён'
      : project.status === 'in-progress'
      ? '🔄 В работе'
      : project.status === 'review'
      ? '👀 На проверке'
      : '📋 В бэклоге'
  }

${project.description}

Бюджет проекта: ${formatMoney(project.budget)}
Срок сдачи: ${formatDate(project.deadline)}

${task ? `Текущая задача: "${task.title}" — ${task.status === 'done' ? 'выполнена' : task.status === 'in-progress' ? 'в работе' : 'ожидает выполнения'}.` : ''}`
  : `Благодарю Вас за сотрудничество. Готов(а) обсудить новые проекты и задачи.

Если у Вас есть вопросы или предложения по дальнейшему сотрудничеству, пожалуйста, свяжитесь со мной.

Мои контакты:
Email: freelancer@example.com
Телефон: +7 (999) 000-00-00`}

С уважением,
Фрилансер
`;

      default:
        return '';
    }
  };

  const content = generateContent();

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docType}_${client.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Генерация документа</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
          </div>

          {/* Doc Type Selector */}
          <div className="flex gap-2">
            {docTypes.map((dt) => (
              <button
                key={dt.value}
                onClick={() => setDocType(dt.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  docType === dt.value
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{dt.icon}</span>
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Document Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
              {content}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>📥</span> Скачать
          </button>
          <button
            onClick={handleSend}
            disabled={sent}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              sent
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {sent ? (
              <>
                <span>✅</span> Отправлено!
              </>
            ) : (
              <>
                <span>📤</span> Отправить клиенту
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
