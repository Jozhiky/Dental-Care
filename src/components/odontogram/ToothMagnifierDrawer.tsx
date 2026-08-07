import React from 'react';
import { ToothData, ToothSurface, ClinicalConditionType } from '../../types/odontogram';
import { DESIGN_TOKENS } from '../../theme/tokens';
import { Activity, CheckCircle2, ShieldCheck, Stethoscope, FileText, Zap } from 'lucide-react';

interface ToothMagnifierDrawerProps {
  tooth: ToothData | null;
  onClose: () => void;
  onApplyCondition: (toothNumber: number, surface: ToothSurface, condition: ClinicalConditionType) => void;
  onApplyWholeTooth: (toothNumber: number, condition: ClinicalConditionType) => void;
}

export const ToothMagnifierDrawer: React.FC<ToothMagnifierDrawerProps> = ({
  tooth,
  onClose,
  onApplyCondition,
  onApplyWholeTooth,
}) => {
  if (!tooth) return null;

  const { number, name, isDeciduous, surfaces, generalCondition } = tooth;

  const getSurfaceColor = (surface: ToothSurface): string => {
    if (generalCondition === 'AUSENTE') return '#F1F5F9';
    if (generalCondition === 'CORONA_ACERO') return DESIGN_TOKENS.colors.conditions.CORONA_ACERO.fill;
    const condition = surfaces[surface] || 'SANO';
    return DESIGN_TOKENS.colors.conditions[condition]?.fill || '#FFFFFF';
  };

  // Calculate Caries ICDAS II Score Index
  const cariesSurfacesCount = Object.values(surfaces).filter((c) => c === 'CARIES').length;
  const getIcdasScore = () => {
    if (generalCondition === 'CORONA_ACERO') return { code: 'ICDAS 6', label: 'Restauración Completa (Corona)', bg: 'bg-purple-100 text-purple-800' };
    if (cariesSurfacesCount === 0) return { code: 'ICDAS 0', label: 'Esmalte Sano', bg: 'bg-emerald-100 text-emerald-800' };
    if (cariesSurfacesCount === 1) return { code: 'ICDAS 2', label: 'Caries Incipiente en Fosas', bg: 'bg-amber-100 text-amber-800' };
    return { code: 'ICDAS 4', label: 'Caries Moderada / Cavitada', bg: 'bg-rose-100 text-rose-800' };
  };

  const icdas = getIcdasScore();

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150">
      <div className="bg-white/95 backdrop-blur-2xl border-l border-slate-200 w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-drawer-in flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center border-2 ${
                  isDeciduous
                    ? 'bg-[#FEF3C7] text-[#78350F] border-[#F59E0B]'
                    : 'bg-[#E6F4F1] text-[#0F766E] border-[#1A7B82]'
                }`}
              >
                {number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 font-outfit">{name}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${icdas.bg}`}>
                    {icdas.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Diente FDI {number} • {isDeciduous ? 'Dentición Decidua (Leche)' : 'Dentición Permanente (Adulto)'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          {/* Interactive Magnified Anatomical 3D Inspector Canvas */}
          <div className="enterprise-glass-card p-6 flex flex-col items-center space-y-3 relative overflow-hidden bg-slate-50/50">
            <span className="text-[10px] font-extrabold text-[#1A7B82] uppercase tracking-wider bg-[#E6F4F1] px-2.5 py-0.5 rounded-full border border-[#1A7B82]/20">
              Inspector Magnificado de 5 Caras
            </span>

            <div className="relative my-2 drop-shadow-md">
              <svg width="180" height="180" viewBox="0 0 100 100" className="overflow-visible">
                <rect x="2" y="2" width="96" height="96" rx="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />

                {/* Vestibular */}
                <polygon
                  points="2,2 98,2 72,28 28,28"
                  fill={getSurfaceColor('vestibular')}
                  stroke="#64748B"
                  strokeWidth="2.5"
                  className="tooth-surface"
                  onClick={() => onApplyCondition(number, 'vestibular', 'CARIES')}
                />

                {/* Distal */}
                <polygon
                  points="98,2 98,98 72,72 72,28"
                  fill={getSurfaceColor('distal')}
                  stroke="#64748B"
                  strokeWidth="2.5"
                  className="tooth-surface"
                  onClick={() => onApplyCondition(number, 'distal', 'CARIES')}
                />

                {/* Palatino */}
                <polygon
                  points="2,98 98,98 72,72 28,72"
                  fill={getSurfaceColor('palatino')}
                  stroke="#64748B"
                  strokeWidth="2.5"
                  className="tooth-surface"
                  onClick={() => onApplyCondition(number, 'palatino', 'CARIES')}
                />

                {/* Mesial */}
                <polygon
                  points="2,2 2,98 28,72 28,28"
                  fill={getSurfaceColor('mesial')}
                  stroke="#64748B"
                  strokeWidth="2.5"
                  className="tooth-surface"
                  onClick={() => onApplyCondition(number, 'mesial', 'CARIES')}
                />

                {/* Oclusal */}
                <polygon
                  points="28,28 72,28 72,72 28,72"
                  fill={getSurfaceColor('oclusal')}
                  stroke="#64748B"
                  strokeWidth="2.5"
                  className="tooth-surface"
                  onClick={() => onApplyCondition(number, 'oclusal', 'CARIES')}
                />

                {/* Labels on SVG */}
                <text x="50" y="16" textAnchor="middle" fill="#1E293B" fontSize="10" fontWeight="bold">V</text>
                <text x="85" y="53" textAnchor="middle" fill="#1E293B" fontSize="10" fontWeight="bold">D</text>
                <text x="50" y="90" textAnchor="middle" fill="#1E293B" fontSize="10" fontWeight="bold">P/L</text>
                <text x="15" y="53" textAnchor="middle" fill="#1E293B" fontSize="10" fontWeight="bold">M</text>
                <text x="50" y="53" textAnchor="middle" fill="#1E293B" fontSize="10" fontWeight="bold">O</text>
              </svg>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Haz clic en cualquier cara magnificada para modificar su estado directamente.
            </p>
          </div>

          {/* Quick Surface Inspector Controls */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-[#1A7B82]" />
              Acciones Clínicas Directas por Cara
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {(['vestibular', 'oclusal', 'mesial', 'distal', 'palatino'] as ToothSurface[]).map((surf) => (
                <div key={surf} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold uppercase text-slate-800">{surf}</span>
                    <div className="text-[10px] text-slate-500">{surfaces[surf] || 'SANO'}</div>
                  </div>
                  <button
                    onClick={() => onApplyCondition(number, surf, 'CARIES')}
                    className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-[10px]"
                  >
                    Caries
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Whole Tooth Override */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Estado General de la Pieza Dental
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => onApplyWholeTooth(number, 'CORONA_ACERO')}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-left"
              >
                👑 Corona Acero
              </button>
              <button
                onClick={() => onApplyWholeTooth(number, 'AUSENTE')}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-left"
              >
                🚫 Diente Ausente
              </button>
              <button
                onClick={() => onApplyWholeTooth(number, 'EXTRACCION_INDICADA')}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-left"
              >
                ❌ Extracción Indicada
              </button>
              <button
                onClick={() => onApplyWholeTooth(number, 'SANO')}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-left"
              >
                ✨ Restablecer Sano
              </button>
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-4 border-t border-slate-200/80">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#1A7B82] hover:bg-[#0F766E] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            Guardar & Cerrar Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
