import React, { useState } from 'react';
import { DentalViewer3D, CameraPreset } from './DentalViewer3D';
import { Box, Layers, Camera } from 'lucide-react';

export const DentalStudio: React.FC = () => {
  const [teethCount, setTeethCount] = useState<number>(32);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('frontal');

  return (
    <div className="w-full h-full min-h-0 overflow-hidden flex flex-col gap-3">
      <div className="h-12 shrink-0 clean-card px-4 bg-white border-l-4 border-l-[#1A7B82] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-[#1A7B82]" />
          <h2 className="text-xs font-black text-slate-900 font-outfit uppercase tracking-wider">
            Dentadura 3D Anatómica Base — Gauntlet de Render
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Prueba Progresiva:</span>
          {[1, 4, 8, 16, 32].map((num) => (
            <button
              key={num}
              onClick={() => setTeethCount(num)}
              className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all border ${
                teethCount === num
                  ? 'bg-[#1A7B82] text-white border-[#1A7B82] shadow-xs scale-105'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {num === 1 ? '1 Diente' : `${num} Dientes`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-3 overflow-hidden">
        <div className="relative w-full h-full min-h-0 overflow-hidden flex flex-col">
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-md">
            <button
              onClick={() => setCameraPreset('frontal')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                cameraPreset === 'frontal'
                  ? 'bg-[#1A7B82] text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Vista Frontal
            </button>
            <button
              onClick={() => setCameraPreset('superior')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                cameraPreset === 'superior'
                  ? 'bg-[#1A7B82] text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Vista Superior (Oclusal)
            </button>
            <button
              onClick={() => setCameraPreset('inferior')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                cameraPreset === 'inferior'
                  ? 'bg-[#1A7B82] text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Vista Inferior (Oclusal)
            </button>
            <button
              onClick={() => setCameraPreset('lateral_right')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                cameraPreset === 'lateral_right'
                  ? 'bg-[#1A7B82] text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Lateral Der.
            </button>
            <button
              onClick={() => setCameraPreset('lateral_left')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                cameraPreset === 'lateral_left'
                  ? 'bg-[#1A7B82] text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Lateral Izq.
            </button>
            <button
              onClick={() => setCameraPreset('reset')}
              className="px-2.5 py-1 text-[11px] font-black bg-[#E6F4F1] text-[#1A7B82] hover:bg-[#1A7B82] hover:text-white rounded-lg transition-all"
            >
              Reset
            </button>
          </div>

          <DentalViewer3D teethCount={teethCount} activeCameraPreset={cameraPreset} />
        </div>

        <div className="w-full h-full min-h-0 overflow-y-auto clean-card p-4 space-y-4 bg-white border border-slate-200/90 rounded-2xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1A7B82]" />
              Geometría & Anatomía Dental 3D
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Etapa de estabilización: primero verificamos 1 → 4 → 8 → 16 → 32 piezas sin errores de geometría.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-bold">
              <span className="text-slate-600">Piezas solicitadas:</span>
              <span className="text-[#1A7B82] font-black">{teethCount} Dientes</span>
            </div>

            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1.5">
              <div className="font-extrabold text-[11px] flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                Generador Anatómico Activo
              </div>
              <ul className="text-[10px] text-emerald-800 space-y-1 font-medium list-disc pl-3">
                <li><strong>Incisivos:</strong> centrales y laterales diferenciados.</li>
                <li><strong>Caninos:</strong> cúspide y raíz larga.</li>
                <li><strong>Premolares:</strong> primer y segundo premolar diferenciados.</li>
                <li><strong>Molares:</strong> primer, segundo y tercer molar diferenciados.</li>
                <li><strong>Encías:</strong> se reintroducirán después de validar las 32 piezas.</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
            <span className="font-bold text-slate-800 block">💡 Validación:</span>
            <p className="text-slate-600 font-medium leading-relaxed">
              Cambia la cantidad de piezas y las cámaras. La consola debe mostrar boundsFinite: true y la cantidad renderizada debe coincidir con la solicitada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
