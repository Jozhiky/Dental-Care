import React from 'react';
import { Sparkles, Activity, ShieldCheck, Clock } from 'lucide-react';

interface EruptionTrackerProps {
  childAge: number;
}

export const EruptionTracker: React.FC<EruptionTrackerProps> = ({ childAge }) => {
  // 7 years old child: ~30% permanent eruption (Inc Central + 1st Molars)
  const eruptionPercent = Math.min(100, Math.max(0, Math.round(((childAge - 5) / 7) * 100)));

  return (
    <div className="enterprise-glass-card p-4 space-y-3 ambient-teal-glow">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1A7B82]" />
          <h3 className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
            Monitor de Erupción & Recambio Pediátrico
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4F1] text-[#0F766E] border border-[#1A7B82]/20">
          Edad Paciente: {childAge} Años
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-700">Progreso de Recambio Fisiológico:</span>
          <span className="text-[#1A7B82] font-bold">{eruptionPercent}% Exfoliado</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
          <div
            className="bg-gradient-to-r from-[#1A7B82] to-[#0F766E] h-full rounded-full transition-all duration-500"
            style={{ width: `${eruptionPercent}%` }}
          />
        </div>
      </div>

      {/* Timeline Milestone Indicators */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/80 text-[11px]">
          <div className="font-bold text-[#0F766E]">6 - 7 Años (Actual)</div>
          <div className="text-slate-500 text-[10px]">Primeros molares & Incisivos centrales</div>
        </div>
        <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/80 text-[11px] opacity-70">
          <div className="font-bold text-slate-700">8 - 9 Años</div>
          <div className="text-slate-500 text-[10px]">Incisivos laterales superiores</div>
        </div>
        <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/80 text-[11px] opacity-70">
          <div className="font-bold text-slate-700">10 - 12 Años</div>
          <div className="text-slate-500 text-[10px]">Caninos & premolares definitivos</div>
        </div>
      </div>
    </div>
  );
};
