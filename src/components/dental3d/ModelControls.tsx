import React from 'react';
import { Eye, EyeOff, Layers, Download, Info, CheckCircle2, Box } from 'lucide-react';
import { DentalTooth, ReconstructionConfig } from '../../types/dental3d';
import { ModelExportService } from '../../services/modelExportService';
import * as THREE from 'three';

interface ModelControlsProps {
  selectedTooth: DentalTooth | null;
  teeth: DentalTooth[];
  config: ReconstructionConfig;
  onChangeConfig: (newConfig: ReconstructionConfig) => void;
  showWireframe: boolean;
  onToggleWireframe: () => void;
  showGum: boolean;
  onToggleGum: () => void;
  isXRayMode: boolean;
  onToggleXRay: () => void;
  onToggleAllTeeth: (visible: boolean) => void;
  archGroupRef: React.RefObject<THREE.Group | null>;
}

export const ModelControls: React.FC<ModelControlsProps> = ({
  selectedTooth,
  teeth,
  config,
  onChangeConfig,
  showWireframe,
  onToggleWireframe,
  showGum,
  onToggleGum,
  isXRayMode,
  onToggleXRay,
  onToggleAllTeeth,
  archGroupRef,
}) => {
  const handleExportGLB = () => {
    if (archGroupRef.current) {
      ModelExportService.exportToGLB(archGroupRef.current, 'Dentadura_3D_Individual.glb');
    }
  };

  const handleExportOBJ = () => {
    if (archGroupRef.current) {
      ModelExportService.exportToOBJ(archGroupRef.current, 'Dentadura_3D_Individual.obj');
    }
  };

  const handleExportSTL = () => {
    if (archGroupRef.current) {
      ModelExportService.exportToSTL(archGroupRef.current, 'Dentadura_3D_Impresion.stl');
    }
  };

  return (
    <div className="clean-card p-4 space-y-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col h-full">
      {/* Selected Tooth Info */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xs font-black text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1A7B82]" />
          Información del Diente Seleccionado
        </h3>

        {selectedTooth ? (
          <div className="mt-2.5 p-3 bg-[#E6F4F1]/60 rounded-xl border border-[#1A7B82]/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#0F766E]">
                {selectedTooth.fdiCode ? `Diente FDI ${selectedTooth.fdiCode}` : `Pieza ${selectedTooth.id}`}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-white text-[#1A7B82] rounded-md border border-[#1A7B82]/20">
                {selectedTooth.toothType.replace('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Ancho estimado</span>
                <strong className="text-slate-800 font-bold">{Math.round(selectedTooth.width * 0.15 * 10) / 10} mm</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Confianza IA</span>
                <strong className="text-emerald-700 font-bold">{Math.round(selectedTooth.confidence * 100)}%</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-400 font-medium">
            Haz clic en una pieza dental del visor 3D para inspeccionarla.
          </div>
        )}
      </div>

      {/* Global Display Toggles */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Controles Visuales & Modos
        </span>

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
            isXRayMode ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-sky-600" />
          {isXRayMode ? 'Desactivar Modo Radiografía X-Ray' : 'Modo Transparente / Radiografía X-Ray'}
        </button>
      </div>

      {/* Global Show / Hide All Teeth */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onToggleAllTeeth(true)}
          className="text-xs font-bold text-[#1A7B82] hover:underline"
        >
          [Mostrar todos los dientes]
        </button>
        <button
          onClick={() => onToggleAllTeeth(false)}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline"
        >
          [Ocultar todos]
        </button>
      </div>

      {/* Export Section */}
      <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-[#1A7B82]" /> Exportar Modelo 3D Editable
        </span>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleExportGLB}
            disabled={teeth.length === 0}
            className="py-2.5 px-2 bg-[#1A7B82] hover:bg-[#0F766E] disabled:bg-slate-200 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1"
          >
            GLB
          </button>

          <button
            onClick={handleExportOBJ}
            disabled={teeth.length === 0}
            className="py-2.5 px-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1"
          >
            OBJ
          </button>

          <button
            onClick={handleExportSTL}
            disabled={teeth.length === 0}
            className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 text-slate-800 rounded-xl text-xs font-black border border-slate-200 transition-all flex items-center justify-center gap-1"
          >
            STL
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center font-medium">
          El formato GLB preserva los nodos `Tooth_11`, `Tooth_12`... y `GumMesh` independientes.
        </p>
      </div>
    </div>
  );
};
