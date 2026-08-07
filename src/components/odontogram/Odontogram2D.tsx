import React from 'react';
import { ToothDefinition, ToothStatus } from '../../types/dental';

interface Odontogram2DProps {
  teeth: ToothDefinition[];
  selectedFdiCode: string | null;
  onSelectTooth: (fdiCode: string) => void;
}

const STATUS_COLORS: Record<ToothStatus, { bg: string; text: string; border: string; label: string }> = {
  healthy: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Sano' },
  caries: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-400', label: 'Caries' },
  restoration: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', label: 'Restaurado' },
  crown: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600', label: 'Corona' },
  rootCanal: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300', label: 'Endodoncia' },
  implant: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', label: 'Implante' },
  missing: { bg: 'bg-rose-50', text: 'text-rose-400', border: 'border-rose-200 line-through', label: 'Ausente' },
};

export const Odontogram2D: React.FC<Odontogram2DProps> = ({
  teeth,
  selectedFdiCode,
  onSelectTooth,
}) => {
  // Group teeth into 4 FDI Quadrants
  const q1 = teeth.filter((t) => t.quadrant === 1); // 18 -> 11
  const q2 = teeth.filter((t) => t.quadrant === 2); // 21 -> 28
  const q4 = teeth.filter((t) => t.quadrant === 4); // 48 -> 41
  const q3 = teeth.filter((t) => t.quadrant === 3); // 31 -> 38

  const renderToothCell = (tooth: ToothDefinition) => {
    const isSelected = tooth.fdiCode === selectedFdiCode;
    const style = STATUS_COLORS[tooth.status];

    return (
      <button
        key={tooth.fdiCode}
        onClick={() => onSelectTooth(tooth.fdiCode)}
        className={`relative flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all ${
          isSelected
            ? 'bg-[#1A7B82] text-white border-[#1A7B82] shadow-md scale-105 z-10 ring-2 ring-[#1A7B82]/40'
            : `${style.bg} ${style.border} hover:border-[#1A7B82] hover:scale-102`
        }`}
      >
        <span className={`text-[10px] font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
          {tooth.fdiCode}
        </span>
        <span className={`text-[9px] font-extrabold truncate max-w-[45px] ${isSelected ? 'text-white/90' : style.text}`}>
          {style.label}
        </span>
      </button>
    );
  };

  return (
    <div className="clean-card p-3.5 space-y-3 bg-white border border-slate-200/90 rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-xs font-black text-slate-900 font-outfit uppercase tracking-wider">
          Odontograma FDI 2D Sincronizado (32 Dientes)
        </h3>
        <span className="text-[10px] font-bold text-[#1A7B82] bg-[#E6F4F1] px-2 py-0.5 rounded-md">
          Clic para Seleccionar en 3D
        </span>
      </div>

      {/* MAXILAR SUPERIOR GRID (Q1 | Q2) */}
      <div className="space-y-1">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
          ▲ Maxilar Superior (Arco 1 & 2)
        </div>
        <div className="grid grid-cols-16 gap-1 bg-slate-50 p-2 rounded-xl border border-slate-200/80 overflow-x-auto">
          {q1.map(renderToothCell)}
          {q2.map(renderToothCell)}
        </div>
      </div>

      {/* MANDÍBULA INFERIOR GRID (Q4 | Q3) */}
      <div className="space-y-1">
        <div className="grid grid-cols-16 gap-1 bg-slate-50 p-2 rounded-xl border border-slate-200/80 overflow-x-auto">
          {q4.map(renderToothCell)}
          {q3.map(renderToothCell)}
        </div>
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
          ▼ Mandíbula Inferior (Arco 4 & 3)
        </div>
      </div>
    </div>
  );
};
