import React from 'react';
import { ToothData, ToothSurface, ClinicalConditionType } from '../../types/odontogram';
import { DESIGN_TOKENS } from '../../theme/tokens';

interface ToothSvgProps {
  tooth: ToothData;
  selectedSurface?: ToothSurface | null;
  selectedCondition: ClinicalConditionType;
  onSurfaceClick: (toothNumber: number, surface: ToothSurface) => void;
  onToothGeneralClick: (toothNumber: number) => void;
  isCompact?: boolean;
}

export const ToothSvg: React.FC<ToothSvgProps> = ({
  tooth,
  onSurfaceClick,
  onToothGeneralClick,
  isCompact = false,
}) => {
  const { number, isDeciduous, surfaces, generalCondition, name } = tooth;

  const getSurfaceColor = (surface: ToothSurface): string => {
    if (generalCondition === 'AUSENTE') return '#E2E8F0';
    if (generalCondition === 'CORONA_ACERO') return DESIGN_TOKENS.colors.conditions.CORONA_ACERO.fill;
    const condition = surfaces[surface] || 'SANO';
    return DESIGN_TOKENS.colors.conditions[condition]?.fill || '#FFFFFF';
  };

  const getSurfaceStroke = (surface: ToothSurface): string => {
    if (generalCondition === 'AUSENTE') return '#334155';
    const condition = surfaces[surface] || 'SANO';
    return DESIGN_TOKENS.colors.conditions[condition]?.stroke || '#94A3B8';
  };

  const isWholeToothCondition =
    generalCondition === 'AUSENTE' ||
    generalCondition === 'CORONA_ACERO' ||
    generalCondition === 'EXTRACCION_INDICADA';

  return (
    <div className="flex flex-col items-center select-none tooth-capsule p-1">
      {/* FDI Pill Capsule Header */}
      <button
        onClick={() => onToothGeneralClick(number)}
        title={`Diente FDI ${number}: ${name} (${isDeciduous ? 'Deciduo / Leche' : 'Permanente'})`}
        className={`px-2 py-0.5 rounded-full text-xs font-black transition-all shadow-xs ${
          isDeciduous
            ? 'bg-[#FEF3C7] text-[#78350F] border-2 border-[#F59E0B]'
            : 'bg-[#E6F4F1] text-[#0F766E] border-2 border-[#1A7B82]'
        } ${isWholeToothCondition ? 'ring-2 ring-rose-600 ring-offset-1' : ''}`}
      >
        {number}
      </button>

      {/* Porcelain 3D Anatomical Tooth Vector */}
      <div className="relative my-1 cursor-pointer">
        <svg
          width={isCompact ? "46" : "56"}
          height={isCompact ? "46" : "56"}
          viewBox="0 0 100 100"
          className="overflow-visible filter drop-shadow-md"
        >
          {/* Outer Porcelain Curved Hull */}
          <rect x="2" y="2" width="96" height="96" rx="20" fill="url(#porcelainGradient)" stroke="#94A3B8" strokeWidth="3" />

          <defs>
            <linearGradient id="porcelainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>
          </defs>

          {/* Vestibular (Top Surface) */}
          <polygon
            points="2,2 98,2 72,28 28,28"
            fill={getSurfaceColor('vestibular')}
            stroke={getSurfaceStroke('vestibular')}
            strokeWidth="3"
            className="tooth-surface"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(number, 'vestibular');
            }}
          />

          {/* Distal (Right Surface) */}
          <polygon
            points="98,2 98,98 72,72 72,28"
            fill={getSurfaceColor('distal')}
            stroke={getSurfaceStroke('distal')}
            strokeWidth="3"
            className="tooth-surface"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(number, 'distal');
            }}
          />

          {/* Palatino / Lingual (Bottom Surface) */}
          <polygon
            points="2,98 98,98 72,72 28,72"
            fill={getSurfaceColor('palatino')}
            stroke={getSurfaceStroke('palatino')}
            strokeWidth="3"
            className="tooth-surface"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(number, 'palatino');
            }}
          />

          {/* Mesial (Left Surface) */}
          <polygon
            points="2,2 2,98 28,72 28,28"
            fill={getSurfaceColor('mesial')}
            stroke={getSurfaceStroke('mesial')}
            strokeWidth="3"
            className="tooth-surface"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(number, 'mesial');
            }}
          />

          {/* Oclusal / Incisal (Center Fissures Surface) */}
          <polygon
            points="28,28 72,28 72,72 28,72"
            fill={getSurfaceColor('oclusal')}
            stroke={getSurfaceStroke('oclusal')}
            strokeWidth="3"
            className="tooth-surface"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(number, 'oclusal');
            }}
          />

          {/* Central Oclusal Fissure Lines Pattern */}
          <path
            d="M50 28 V72 M28 50 H72"
            stroke={surfaces.oclusal === 'SANO' ? '#CBD5E1' : '#FFFFFF'}
            strokeWidth="2"
            strokeDasharray="2 2"
            pointerEvents="none"
          />

          {/* Whole Tooth Symbols */}
          {generalCondition === 'AUSENTE' && (
            <g stroke="#0F172A" strokeWidth="8" strokeLinecap="round">
              <line x1="12" y1="12" x2="88" y2="88" />
              <line x1="88" y1="12" x2="12" y2="88" />
            </g>
          )}

          {generalCondition === 'CORONA_ACERO' && (
            <g>
              <rect x="18" y="18" width="64" height="64" rx="16" fill="#7C3AED" stroke="#4C1D95" strokeWidth="4" />
              <text x="50" y="62" textAnchor="middle" fill="#FFFFFF" fontSize="38" fontWeight="900" fontFamily="sans-serif">
                C
              </text>
            </g>
          )}

          {generalCondition === 'EXTRACCION_INDICADA' && (
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E11D48" strokeWidth="8" strokeDasharray="8 4" />
          )}
        </svg>
      </div>

      {/* Tooth Name Label */}
      <span className="text-[11px] font-bold text-slate-800 truncate max-w-[56px] text-center mt-0.5">
        {name.split(' ')[0]}
      </span>
    </div>
  );
};
