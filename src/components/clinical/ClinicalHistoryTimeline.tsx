import React from 'react';
import { History, Stethoscope, CheckCircle2, FileText, User } from 'lucide-react';
import { TreatmentHistoryItem } from '../../types/odontogram';

const SAMPLE_TIMELINE: TreatmentHistoryItem[] = [
  {
    id: '1',
    timestamp: '2026-08-05 10:30',
    toothNumber: 55,
    surface: 'oclusal',
    condition: 'SELLANTE',
    dentistName: 'Dra. Elena Alarcón',
    notes: 'Aplicación de sellante fotocurable de fosas y fisuras con grabado ácido previo.',
  },
  {
    id: '2',
    timestamp: '2026-08-05 10:45',
    toothNumber: 74,
    condition: 'CORONA_ACERO',
    dentistName: 'Dra. Elena Alarcón',
    notes: 'Cementación de corona de acero cromo preformada con ionómero de vidrio.',
  },
  {
    id: '3',
    timestamp: '2026-06-15 11:15',
    toothNumber: 85,
    surface: 'oclusal',
    condition: 'SELLANTE',
    dentistName: 'Dra. Elena Alarcón',
    notes: 'Control preventivo y sellante en molar deciduo.',
  },
  {
    id: '4',
    timestamp: '2026-06-15 11:30',
    toothNumber: 64,
    surface: 'mesial',
    condition: 'OBTURADO',
    dentistName: 'Dra. Elena Alarcón',
    notes: 'Restauración estética en resina de alta densidad.',
  },
];

export const ClinicalHistoryTimeline: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="clean-card p-4 bg-white border-l-4 border-l-[#1A7B82] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-2">
            <History className="w-5 h-5 text-[#1A7B82]" />
            Historial de Intervenciones Clínicas (Timeline Pediátrico)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Línea de tiempo cronológica de procedimientos odontopediatrícos ejecutados.
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div className="clean-card p-6 bg-white space-y-6">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {SAMPLE_TIMELINE.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline Node Icon */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#1A7B82] text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white" />
              </div>

              {/* Card Item */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 hover:border-[#1A7B82]/40 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-black bg-[#E6F4F1] text-[#0F766E] border border-[#1A7B82]/20">
                      Diente FDI {item.toothNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-200 text-slate-800 uppercase">
                      {item.surface ? `Cara ${item.surface}` : 'Estado General'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#1A7B82] text-white">
                      {item.condition}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{item.timestamp}</span>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {item.notes}
                </p>

                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 pt-1 border-t border-slate-200/60">
                  <User className="w-3 h-3 text-[#1A7B82]" />
                  <span>Tratamiento realizado por: <strong>{item.dentistName}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
