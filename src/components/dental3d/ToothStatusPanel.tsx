import React from 'react';
import { ToothDefinition, ToothStatus } from '../../types/dental';
import { ShieldCheck, Activity, Download, Eye, EyeOff, Layers, Sparkles } from 'lucide-react';
import { ModelExportService } from '../../services/modelExportService';
import * as THREE from 'three';

interface ToothStatusPanelProps {
  selectedTooth: ToothDefinition | null;
  onUpdateStatus: (fdiCode: string, status: ToothStatus) => void;
  showGum: boolean;
  onToggleGum: () => void;
  showWireframe: boolean;
  onToggleWireframe: () => void;
  isXRayMode: boolean;
  onToggleXRay: () => void;
  explodedFactor: number;
  onChangeExplodedFactor: (val: number) => void;
  fullModelRef: React.RefObject<THREE.Group | null>;
}

const STATUS_OPTIONS: { status: ToothStatus; label: string; desc: string; colorClass: string }[] = [
  { status: 'healthy', label: 'Sano', desc: 'Esmalte cerámico natural intacto', colorClass: 'bg-emerald-600 text-white' },
  { status: 'caries', label: 'Caries', desc: 'Lesión con pigmentación café', colorClass: 'bg-amber-700 text-white' },
  { status: 'restoration', label: 'Restauración', desc: 'Obturación en resina/amalgama', colorClass: 'bg-slate-700 text-white' },
  { status: 'crown', label: 'Corona', desc: 'Prótesis fija metálica/cerámica', colorClass: 'bg-amber-500 text-white' },
  { status: 'rootCanal', label: 'Endodoncia', desc: 'Tratamiento de conducto', colorClass: 'bg-sky-600 text-white' },
  { status: 'implant', label: 'Implante', desc: 'Perno de titanio intraraquídeo', colorClass: 'bg-purple-700 text-white' },
  { status: 'missing', label: 'Ausente', desc: 'Pieza dental extraída/faltante', colorClass: 'bg-rose-600 text-white' },
];

export const ToothStatusPanel: React.FC<ToothStatusPanelProps> = ({
  selectedTooth,
  onUpdateStatus,
  showGum,
  onToggleGum,
  showWireframe,
  onToggleWireframe,
  isXRayMode,
  onToggleXRay,
  explodedFactor,
  onChangeExplodedFactor,
  fullModelRef,
}) => {
  const handleExportGLB = () => {
    if (fullModelRef.current) {
      ModelExportService.exportToGLB(fullModelRef.current, 'Dentadura_Humana_3D_32_Dientes.glb');
    }
  };

  const handleExportOBJ = () => {
    if (fullModelRef.current) {
      ModelExportService.exportToOBJ(fullModelRef.current, 'Dentadura_Humana_3D_32_Dientes.obj');
    }
  };

  const handleExportSTL = () => {
    if (fullModelRef.current) {
      ModelExportService.exportToSTL(fullModelRef.current, 'Dentadura_Humana_3D_Impresion.stl');
    }
  };

  return (
    <div className="clean-card p-4 space-y-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col h-full">
      {/* Header: Selected Tooth Specs */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xs font-black text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1A7B82]" />
          Acciones & Diagnóstico Clínico
        </h3>

        {selectedTooth ? (
          <div className="mt-2.5 p-3 bg-[#E6F4F1]/70 rounded-xl border border-[#1A7B82]/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-[#0F766E]">
                Diente FDI {selectedTooth.fdiCode}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-white text-[#1A7B82] rounded-md border border-[#1A7B82]/20">
                {selectedTooth.arch === 'upper' ? 'Maxilar Sup.' : 'Mandíbula Inf.'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800">{selectedTooth.name}</p>
          </div>
        ) : (
          <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-400 font-medium">
            Selecciona una pieza dental en la vista 3D o en el odontograma 2D.
          </div>
        )}
      </div>

      {/* Clinical Status Selector Buttons */}
      {selectedTooth && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Cambiar Estado del Diente {selectedTooth.fdiCode}:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.status}
                onClick={() => onUpdateStatus(selectedTooth.fdiCode, opt.status)}
                className={`p-2 text-left rounded-xl text-xs font-bold transition-all border ${
                  selectedTooth.status === opt.status
                    ? `${opt.colorClass} border-transparent shadow-xs scale-[1.02]`
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{opt.label}</span>
                  {selectedTooth.status === opt.status && <ShieldCheck className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[9px] opacity-80 block font-normal truncate mt-0.5">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exploded View Control */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1A7B82]" /> Vista Explotada (Separación 3D)
          </span>
          <span className="text-[#1A7B82] font-black">{Math.round(explodedFactor * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={explodedFactor}
          onChange={(e) => onChangeExplodedFactor(parseFloat(e.target.value))}
          className="w-full accent-[#1A7B82] cursor-pointer"
        />
      </div>

      {/* Visual Display Toggles */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onToggleGum}
          className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
            showGum ? 'bg-[#E6F4F1] text-[#0F766E] border-[#1A7B82]/30' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          {showGum ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showGum ? 'Ocultar Encía' : 'Mostrar Encía'}
        </button>

        <button
          onClick={onToggleWireframe}
          className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
            showWireframe ? 'bg-[#E6F4F1] text-[#0F766E] border-[#1A7B82]/30' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {showWireframe ? 'Malla Sólida' : 'Wireframe'}
        </button>
      </div>

      <button
        onClick={onToggleXRay}
        className={`w-full py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
          isXRayMode ? 'bg-sky-50 text-sky-800 border-sky-300' : 'bg-slate-50 text-slate-600 border-slate-200'
        }`}
      >
        {isXRayMode ? 'Desactivar Modo Radiografía X-Ray' : 'Modo Radiografía X-Ray'}
      </button>

      {/* Export Section */}
      <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-[#1A7B82]" /> Exportar Modelo 3D Editable
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={handleExportGLB}
            className="py-2 bg-[#1A7B82] hover:bg-[#0F766E] text-white rounded-xl text-xs font-black shadow-xs transition-all text-center"
          >
            GLB
          </button>
          <button
            onClick={handleExportOBJ}
            className="py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black shadow-xs transition-all text-center"
          >
            OBJ
          </button>
          <button
            onClick={handleExportSTL}
            className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black border border-slate-200 transition-all text-center"
          >
            STL
          </button>
        </div>
      </div>
    </div>
  );
};
