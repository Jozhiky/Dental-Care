import React, { useState } from 'react';
import { User, Calendar, Clock, CheckCircle2, FileText, ArrowUpRight, ArrowDownRight, Sparkles, Stethoscope } from 'lucide-react';
import { PediatricPatient } from '../../types/odontogram';

interface MintDenDashboardProps {
  patient: PediatricPatient;
  onSelectPatient: (name: string) => void;
}

const TODAY_SCHEDULE = [
  { id: '1', name: 'Mateo Silva Gómez', time: '08:00 AM', type: 'Profilaxis & Sellantes', status: 'En Sillón', active: true },
  { id: '2', name: 'Camila Torres Ríos', time: '10:00 AM', type: 'Caries Oclusal (54)', status: 'En Espera', active: false },
  { id: '3', name: 'Lucas Mendoza Benítez', time: '02:00 PM', type: 'Corona Acero (74)', status: 'Pendiente', active: false },
  { id: '4', name: 'Jenny Wilson Ruiz', time: '04:00 PM', type: 'Control Ortopedia', status: 'Pendiente', active: false },
];

export const MintDenDashboard: React.FC<MintDenDashboardProps> = ({ patient, onSelectPatient }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('1');

  return (
    <div className="space-y-4">
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-outfit">
            Buenos Días, <span className="text-[#1A7B82]">Dra. Elena Alarcón</span> 👋
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Sede Principal Lima - Miraflores • Resumen de Atención del Día
          </p>
        </div>
      </div>

      {/* Hero Visits Banner (Replicating Image 1 MintDen Card with 3D Tooth & Instruments) */}
      <div className="futuristic-card p-5 bg-gradient-to-r from-white via-slate-50 to-[#E6F4F1]/60 border-l-6 border-l-[#1A7B82] flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-3 z-10">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Atenciones del Día
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 font-outfit">12</span>
            <span className="text-xs font-bold text-slate-500">pacientes</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1A7B82] text-white text-xs font-bold rounded-xl shadow-xs">
              <span>Pacientes Nuevos: 8</span>
              <span className="bg-white/20 px-1.5 rounded text-[10px]">67% ↑</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-100 text-rose-900 text-xs font-bold rounded-xl border border-rose-300">
              <span>Pacientes Recurrentes: 4</span>
              <span className="bg-rose-200 px-1.5 rounded text-[10px]">33% ↓</span>
            </div>
          </div>
        </div>

        {/* 3D Ceramic Tooth Illustration Asset (Replicating Image 1 Right Side Illustration) */}
        <div className="w-48 h-32 rounded-2xl overflow-hidden border-2 border-white shadow-md relative z-10 shrink-0">
          <img
            src="/assets/images/3d_tooth_hero.jpg"
            alt="3D Ceramic Tooth & Instruments"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Middle Row: Patient Schedule List & Active Consultation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Patient List (MintDen Style) */}
        <div className="lg:col-span-5 futuristic-card p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
              Lista de Pacientes
            </h3>
            <span className="text-[10px] font-bold text-[#1A7B82] bg-[#E6F4F1] px-2 py-0.5 rounded-full">
              Hoy
            </span>
          </div>

          <div className="space-y-2">
            {TODAY_SCHEDULE.map((p) => {
              const isSelected = p.id === selectedPatientId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPatientId(p.id);
                    onSelectPatient(p.name);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#1A7B82] bg-[#E6F4F1]/60 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1A7B82] text-white font-black text-xs flex items-center justify-center">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{p.name}</div>
                      <div className="text-[11px] font-semibold text-[#1A7B82]">{p.type}</div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
                    {p.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Consultation Detail Card (MintDen Style) */}
        <div className="lg:col-span-7 futuristic-card p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
              Consulta Activa
            </h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              Prescripción #9C672QAI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] text-[#1A7B82] font-black text-base flex items-center justify-center border border-[#1A7B82]/30">
              {patient.fullName.charAt(0)}
            </div>
            <div>
              <div className="font-black text-sm text-slate-900">{patient.fullName}</div>
              <div className="text-xs font-semibold text-slate-500">{patient.ageYears} años • Apoderado: {patient.guardianName}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 font-bold text-slate-700">
              Ortodoncia
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 font-bold text-slate-700">
              Blanqueamiento
            </div>
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-200 font-bold text-rose-800">
              Caries (54)
            </div>
          </div>

          <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Última revisión:</span>
              <span className="font-bold text-slate-800">Dra. Elena Alarcón — 05 Octubre 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Observación:</span>
              <span className="font-bold text-slate-800">Múltiples caries detectadas en molares; erosión leve de esmalte observada.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Prescripción:</span>
              <span className="font-bold text-[#1A7B82]">Pasta Fluorada - Usar 2 veces al día. Próxima cita: 20 Octubre 2026.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
