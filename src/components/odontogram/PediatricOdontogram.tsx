import React, { useState } from 'react';
import {
  ToothData,
  ToothSurface,
  ClinicalConditionType,
  DentitionMode,
} from '../../types/odontogram';
import { ToothSvg } from './ToothSvg';
import { Anatomical3DDentitionStudio } from './Anatomical3DDentitionStudio';
import { DentalStudio } from '../dental3d/DentalStudio';
import {
  Box,
  RotateCcw,
  ZoomIn,
  Sun,
  Contrast,
  RefreshCw,
  Move,
  Printer,
} from 'lucide-react';

const DECIDUOUS_TEETH_UPPER = [
  { number: 55, name: 'Segundo Molar Leche' },
  { number: 54, name: 'Primer Molar Leche' },
  { number: 53, name: 'Canino Leche' },
  { number: 52, name: 'Incisivo Lateral Leche' },
  { number: 51, name: 'Incisivo Central Leche' },
  { number: 61, name: 'Incisivo Central Leche' },
  { number: 62, name: 'Incisivo Lateral Leche' },
  { number: 63, name: 'Canino Leche' },
  { number: 64, name: 'Primer Molar Leche' },
  { number: 65, name: 'Segundo Molar Leche' },
];

const DECIDUOUS_TEETH_LOWER = [
  { number: 85, name: 'Segundo Molar Leche' },
  { number: 84, name: 'Primer Molar Leche' },
  { number: 83, name: 'Canino Leche' },
  { number: 82, name: 'Incisivo Lateral Leche' },
  { number: 81, name: 'Incisivo Central Leche' },
  { number: 71, name: 'Incisivo Central Leche' },
  { number: 72, name: 'Incisivo Lateral Leche' },
  { number: 73, name: 'Canino Leche' },
  { number: 74, name: 'Primer Molar Leche' },
  { number: 75, name: 'Segundo Molar Leche' },
];

const PERMANENT_TEETH_UPPER = [
  { number: 18, name: 'Tercer Molar' },
  { number: 17, name: 'Segundo Molar' },
  { number: 16, name: 'Primer Molar' },
  { number: 15, name: 'Segundo Premolar' },
  { number: 14, name: 'Primer Premolar' },
  { number: 13, name: 'Canino' },
  { number: 12, name: 'Incisivo Lateral' },
  { number: 11, name: 'Incisivo Central' },
  { number: 21, name: 'Incisivo Central' },
  { number: 22, name: 'Incisivo Lateral' },
  { number: 23, name: 'Canino' },
  { number: 24, name: 'Primer Premolar' },
  { number: 25, name: 'Segundo Premolar' },
  { number: 26, name: 'Primer Molar' },
  { number: 27, name: 'Segundo Molar' },
  { number: 28, name: 'Tercer Molar' },
];

const PERMANENT_TEETH_LOWER = [
  { number: 48, name: 'Tercer Molar' },
  { number: 47, name: 'Segundo Molar' },
  { number: 46, name: 'Primer Molar' },
  { number: 45, name: 'Segundo Premolar' },
  { number: 44, name: 'Primer Premolar' },
  { number: 43, name: 'Canino' },
  { number: 42, name: 'Incisivo Lateral' },
  { number: 41, name: 'Incisivo Central' },
  { number: 31, name: 'Incisivo Central' },
  { number: 32, name: 'Incisivo Lateral' },
  { number: 33, name: 'Canino' },
  { number: 34, name: 'Primer Premolar' },
  { number: 35, name: 'Segundo Premolar' },
  { number: 36, name: 'Primer Molar' },
  { number: 37, name: 'Segundo Molar' },
  { number: 38, name: 'Tercer Molar' },
];

const createInitialTeethState = (): Record<number, ToothData> => {
  const initialMap: Record<number, ToothData> = {};

  const addTeeth = (teeth: { number: number; name: string }[], isDeciduous: boolean) => {
    teeth.forEach(({ number, name }) => {
      initialMap[number] = {
        number,
        isDeciduous,
        name,
        surfaces: {
          vestibular: 'SANO',
          palatino: 'SANO',
          mesial: 'SANO',
          distal: 'SANO',
          oclusal: 'SANO',
        },
      };
    });
  };

  addTeeth(DECIDUOUS_TEETH_UPPER, true);
  addTeeth(DECIDUOUS_TEETH_LOWER, true);
  addTeeth(PERMANENT_TEETH_UPPER, false);
  addTeeth(PERMANENT_TEETH_LOWER, false);

  initialMap[55].surfaces.oclusal = 'SELLANTE';
  initialMap[54].surfaces.oclusal = 'CARIES';
  initialMap[64].surfaces.mesial = 'OBTURADO';
  initialMap[85].surfaces.oclusal = 'SELLANTE';
  initialMap[74].generalCondition = 'CORONA_ACERO';

  return initialMap;
};

export const PediatricOdontogram: React.FC = () => {
  const [dentitionMode, setDentitionMode] = useState<DentitionMode>('MIXTA');
  const [teeth, setTeeth] = useState<Record<number, ToothData>>(createInitialTeethState);
  const [activeCondition, setActiveCondition] = useState<ClinicalConditionType>('CARIES');
  const [viewMode, setViewMode] = useState<'3D' | 'FDI' | 'STUDIO_INDIVIDUAL'>('STUDIO_INDIVIDUAL');

  const handleSurfaceClick = (toothNumber: number, surface: ToothSurface) => {
    setTeeth((prev) => {
      const tooth = prev[toothNumber];
      if (!tooth) return prev;

      const updatedSurfaces = {
        ...tooth.surfaces,
        [surface]: activeCondition,
      };

      return {
        ...prev,
        [toothNumber]: {
          ...tooth,
          surfaces: updatedSurfaces,
          generalCondition: activeCondition === 'SANO' ? undefined : tooth.generalCondition,
        },
      };
    });
  };

  const handleWholeToothCondition = (toothNumber: number, condition: ClinicalConditionType) => {
    setTeeth((prev) => {
      const tooth = prev[toothNumber];
      if (!tooth) return prev;

      return {
        ...prev,
        [toothNumber]: {
          ...tooth,
          generalCondition: condition === 'SANO' ? undefined : condition,
        },
      };
    });
  };

  return (
    <div className="space-y-3">
      {/* TOOLBAR ROW (Replicating Denty ai Toolbar Exactly) */}
      <div className="futuristic-card p-2 bg-white flex items-center justify-between overflow-x-auto no-print">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode(viewMode === 'STUDIO_INDIVIDUAL' ? '3D' : 'STUDIO_INDIVIDUAL')}
            className={`denty-tool-btn ${viewMode === 'STUDIO_INDIVIDUAL' ? 'border-[#1A7B82] bg-[#1A7B82] text-white font-bold' : ''}`}
          >
            <Box className="w-4 h-4 mb-0.5" />
            <span>Reconstrucción 3D Piezas</span>
          </button>
          <button
            onClick={() => setViewMode(viewMode === '3D' ? 'FDI' : '3D')}
            className={`denty-tool-btn ${viewMode === '3D' ? 'border-[#1A7B82] bg-[#E6F4F1] text-[#1A7B82]' : ''}`}
          >
            <Box className="w-4 h-4 mb-0.5" />
            <span>Vista 3D Anatómica</span>
          </button>
          <button className="denty-tool-btn">
            <RotateCcw className="w-4 h-4 mb-0.5 text-slate-500" />
            <span>Reiniciar Filtros</span>
          </button>
          <button className="denty-tool-btn">
            <ZoomIn className="w-4 h-4 mb-0.5 text-slate-500" />
            <span>Ampliar</span>
          </button>
          <button className="denty-tool-btn">
            <Contrast className="w-4 h-4 mb-0.5 text-slate-500" />
            <span>Invertir</span>
          </button>
          <button className="denty-tool-btn">
            <Contrast className="w-4 h-4 mb-0.5 text-slate-500" />
            <span>Contraste</span>
          </button>
          <button className="denty-tool-btn">
            <Sun className="w-4 h-4 mb-0.5 text-slate-500" />
            <span>Brillo</span>
          </button>
          <button className="denty-tool-btn">
            <RefreshCw className="w-4 h-4 mb-0.5 text-slate-500" />
            <span>Recargar</span>
          </button>
          <button className="denty-tool-btn">
            <Move className="w-4 h-4 mb-0.5 text-slate-500" />
            <span>Transformar</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <button
            onClick={() => setDentitionMode('MIXTA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              dentitionMode === 'MIXTA' ? 'bg-[#1A7B82] text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Dentición Mixta
          </button>
        </div>
      </div>

      {/* CANVAS VIEWPORT */}
      {viewMode === 'STUDIO_INDIVIDUAL' ? (
        <DentalStudio />
      ) : viewMode === '3D' ? (
        /* EXACT 1:1 REPLICA OF THE 3D DENTITION STUDIO FROM THE ZOOMED-IN SCREENSHOTS */
        <Anatomical3DDentitionStudio />
      ) : (
        /* FDI ANATOMICAL CANVAS */
        <div className="futuristic-card p-5 space-y-4 bg-white">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A7B82]" />
                Maxilar Superior (Cuadrantes 1, 2, 5, 6)
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">Vestibular (Arriba) / Palatino (Abajo)</span>
            </div>

            <div className="deciduous-quadrant p-2.5">
              <div className="text-[11px] font-extrabold text-[#78350F] mb-1 uppercase tracking-wider">
                Dentición Decidua Superior (Leche 51-65)
              </div>
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto">
                {DECIDUOUS_TEETH_UPPER.map(({ number }) => (
                  <ToothSvg
                    key={number}
                    tooth={teeth[number]}
                    selectedCondition={activeCondition}
                    onSurfaceClick={handleSurfaceClick}
                    onToothGeneralClick={(num) => handleWholeToothCondition(num, 'CORONA_ACERO')}
                    isCompact
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#788A96]" />
                Maxilar Inferior / Mandíbula (Cuadrantes 3, 4, 7, 8)
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">Lingual (Arriba) / Vestibular (Abajo)</span>
            </div>

            <div className="deciduous-quadrant p-2.5">
              <div className="text-[11px] font-extrabold text-[#78350F] mb-1 uppercase tracking-wider">
                Dentición Decidua Inferior (Leche 71-85)
              </div>
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto">
                {DECIDUOUS_TEETH_LOWER.map(({ number }) => (
                  <ToothSvg
                    key={number}
                    tooth={teeth[number]}
                    selectedCondition={activeCondition}
                    onSurfaceClick={handleSurfaceClick}
                    onToothGeneralClick={(num) => handleWholeToothCondition(num, 'CORONA_ACERO')}
                    isCompact
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
