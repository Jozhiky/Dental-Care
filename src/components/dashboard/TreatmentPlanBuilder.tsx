import React, { useState } from 'react';
import { FileText, Printer, Trash2 } from 'lucide-react';

interface ProcedureItem {
  id: string;
  toothNumber: number;
  description: string;
  category: string;
  costPen: number;
  completed: boolean;
}

const INITIAL_PLAN: ProcedureItem[] = [
  {
    id: '1',
    toothNumber: 55,
    description: 'Sellante de fosas y fisuras preventivo',
    category: 'Prevención',
    costPen: 45.00,
    completed: true,
  },
  {
    id: '2',
    toothNumber: 54,
    description: 'Restauración en resina fotocurable cara Oclusal',
    category: 'Operatoria',
    costPen: 85.00,
    completed: false,
  },
  {
    id: '3',
    toothNumber: 74,
    description: 'Colocación de corona de acero cromo preformada',
    category: 'Odontopediatría',
    costPen: 140.00,
    completed: false,
  },
  {
    id: '4',
    toothNumber: 85,
    description: 'Aplicación de flúor barniz 5% NaF',
    category: 'Prevención',
    costPen: 35.00,
    completed: true,
  },
];

export const TreatmentPlanBuilder: React.FC = () => {
  const [items, setItems] = useState<ProcedureItem[]>(INITIAL_PLAN);

  const toggleCompleted = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCostPen = items.reduce((acc, item) => acc + item.costPen, 0);

  return (
    <div className="clean-card p-4 space-y-3 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1A7B82]" />
            Plan de Tratamiento Odontopediátrico & Presupuesto (Perú)
          </h3>
          <p className="text-[11px] text-slate-500">Estimación clínica oficial en Soles Peruanos (S/.) para entrega a padres de familia.</p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 text-xs font-bold bg-[#1A7B82] hover:bg-[#0F766E] text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          Exportar Plan PDF
        </button>
      </div>

      {/* Procedures Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold">
            <tr>
              <th className="p-2 rounded-l-lg">Estado</th>
              <th className="p-2">Diente</th>
              <th className="p-2">Procedimiento Clínico</th>
              <th className="p-2">Categoría</th>
              <th className="p-2">Valor (S/.)</th>
              <th className="p-2 rounded-r-lg text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleCompleted(item.id)}
                    className="w-4 h-4 text-[#1A7B82] rounded-md border-slate-300 focus:ring-0 cursor-pointer"
                  />
                </td>
                <td className="p-2 font-bold text-slate-800">Diente {item.toothNumber}</td>
                <td className={`p-2 font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {item.description}
                </td>
                <td className="p-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E6F4F1] text-[#0F766E]">
                    {item.category}
                  </span>
                </td>
                <td className="p-2 font-bold text-slate-900">
                  S/ {item.costPen.toFixed(2)}
                </td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 font-bold p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Peruvian Soles Summary Bar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-slate-600">
          <span>Total Procedimientos: <strong>{items.length}</strong></span>
          <span>Completados: <strong className="text-emerald-700">{items.filter((i) => i.completed).length}</strong></span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 font-medium mr-2">Presupuesto Estimado:</span>
          <span className="text-base font-extrabold text-[#1A7B82]">
            S/ {totalCostPen.toFixed(2)} PEN
          </span>
        </div>
      </div>
    </div>
  );
};
