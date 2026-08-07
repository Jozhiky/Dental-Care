import React from 'react';
import { FileText, ShieldAlert, Sparkles, Activity, User, Phone } from 'lucide-react';
import { PediatricPatient } from '../../types/odontogram';

interface ClinicalRecordViewProps {
  patient: PediatricPatient;
}

export const ClinicalRecordView: React.FC<ClinicalRecordViewProps> = ({ patient }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="clean-card p-4 bg-white border-l-4 border-l-[#1A7B82] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1A7B82]" />
            Expediente Clínico Odontopediátrico & Anamnesis (Perú)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Ficha médica completa de desarrollo craneofacial, hábitos orales e índice de riesgo.
          </p>
        </div>
        <span className="px-3 py-1 bg-[#E6F4F1] text-[#0F766E] text-xs font-bold rounded-full border border-[#1A7B82]/20">
          HC-PERU-2026-9812
        </span>
      </div>

      {/* Cockpit Dual Layout (8 Cols / 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: 8 COLS - EXAMEN & HÁBITOS */}
        <div className="lg:col-span-8 space-y-3">
          {/* Module 1: Occlusion & Malocclusion */}
          <div className="clean-card p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#1A7B82]" />
                Evaluación de Oclusión & Desarrollo Maxilofacial
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Normoclusión
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold block text-[11px]">Plano Terminal Molar</span>
                <strong className="text-slate-800 font-bold text-xs mt-0.5 block">Escalón Mesial</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold block text-[11px]">Relación Canina</span>
                <strong className="text-slate-800 font-bold text-xs mt-0.5 block">Clase I Bilateral</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-semibold block text-[11px]">Overjet / Overbite</span>
                <strong className="text-slate-800 font-bold text-xs mt-0.5 block">2.0 mm / 30%</strong>
              </div>
            </div>
          </div>

          {/* Module 2: Oral Habits */}
          <div className="clean-card p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Hábitos No Fisiológicos
              </h3>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                En Seguimiento
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                <span className="text-amber-900 font-semibold">Respiración Bucal Nocturna</span>
                <span className="font-extrabold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">Presente</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Interposición Lingual</span>
                <span className="font-bold text-slate-700">Ausente</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Succión Digital / Chupón</span>
                <span className="font-bold text-slate-700">Inactivo</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 COLS - ALERTS & TUTOR CONTACT */}
        <div className="lg:col-span-4 space-y-3">
          {/* Medical Alerts Card */}
          <div className="clean-card p-4 space-y-3 bg-white border-t-4 border-t-rose-500">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Alertas Médicas Rojas
            </h3>

            <div className="space-y-1.5">
              {patient.medicalAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-rose-50 rounded-xl border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  {alert}
                </div>
              ))}
            </div>
          </div>

          {/* Tutor & Peruvian Contact Card */}
          <div className="clean-card p-4 space-y-2.5 bg-white">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#1A7B82]" />
              Datos de Tutor & Contacto
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Tutor Responsable</span>
                <span className="font-bold text-slate-800">{patient.guardianName}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Teléfono (Perú)</span>
                <span className="font-bold text-[#1A7B82] flex items-center gap-1">
                  <Phone className="w-3 h-3" /> +51 987 654 321
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
