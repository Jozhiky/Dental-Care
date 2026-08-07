import React from 'react';

interface ToothMetric {
  toothNumber: number;
  position: 'Upper' | 'Lower';
  label: string;
  percentage: number;
  color: string;
  strokeColor: string;
  badgeBg: string;
}

const METRICS: ToothMetric[] = [
  {
    toothNumber: 55,
    position: 'Upper',
    label: 'Sellante Preventivo',
    percentage: 11,
    color: '#1A7B82',
    strokeColor: '#1A7B82',
    badgeBg: '#E6F4F1',
  },
  {
    toothNumber: 54,
    position: 'Upper',
    label: 'Caries Activa Oclusal',
    percentage: 67,
    color: '#E11D48',
    strokeColor: '#E11D48',
    badgeBg: '#FFE4E6',
  },
  {
    toothNumber: 74,
    position: 'Lower',
    label: 'Corona Acero Cromo',
    percentage: 76,
    color: '#7C3AED',
    strokeColor: '#7C3AED',
    badgeBg: '#F5F3FF',
  },
  {
    toothNumber: 85,
    position: 'Lower',
    label: 'Aplicación Flúor Barniz',
    percentage: 23,
    color: '#059669',
    strokeColor: '#059669',
    badgeBg: '#ECFDF5',
  },
];

export const ToothMetricsHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {METRICS.map((m) => {
        const radius = 18;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (m.percentage / 100) * circumference;

        return (
          <div key={m.toothNumber} className="denty-card p-3.5 flex items-center justify-between bg-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Diente N°</span>
                <span className="text-sm font-black text-slate-900">{m.toothNumber}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                  {m.position === 'Upper' ? 'Superior' : 'Inferior'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-tight">
                {m.label}
              </p>
              <div className="text-[10px] text-slate-400 font-medium">Estado Pediátrico Activo</div>
            </div>

            {/* Donut Progress Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke={m.strokeColor}
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[11px] font-black text-slate-800">
                {m.percentage}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
