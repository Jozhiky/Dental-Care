import React from 'react';
import { PediatricPatient } from '../../types/odontogram';
import { User, Phone, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PatientSummaryCardProps {
  patient: PediatricPatient;
}

export const PatientSummaryCard: React.FC<PatientSummaryCardProps> = ({ patient }) => {
  const getRiskBadge = (risk: PediatricPatient['cariesRisk']) => {
    switch (risk) {
      case 'BAJO':
        return <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">Riesgo Caries: Bajo</span>;
      case 'MEDIO':
        return <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">Riesgo Caries: Medio</span>;
      case 'ALTO':
        return <span className="px-3 py-1 rounded-lg text-xs font-black bg-rose-100 text-rose-900 border border-rose-300">Riesgo Caries: Alto</span>;
    }
  };

  return (
    <div className="readable-card p-5 space-y-4 bg-white border-l-6 border-l-[#1A7B82]">
      {/* Z-Pattern Upper Horizontal Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Upper Left: Patient Profile */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F4F1] text-[#1A7B82] font-black text-xl flex items-center justify-center border-2 border-[#1A7B82]/30 shrink-0">
            {patient.fullName.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-slate-900 font-outfit">{patient.fullName}</h2>
              {getRiskBadge(patient.cariesRisk)}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 font-bold mt-1">
              <span>{patient.ageYears} Años (Dentición Mixta Temprana)</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-800">
                <User className="w-4 h-4 text-[#1A7B82]" />
                Tutor: {patient.guardianName}
              </span>
            </div>
          </div>
        </div>

        {/* Upper Right: Contact & Appointment */}
        <div className="bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200 text-right">
          <div className="font-black text-slate-900 text-sm flex items-center gap-1.5 justify-end">
            <Phone className="w-4 h-4 text-[#1A7B82]" />
            +51 987 654 321
          </div>
          <div className="text-slate-600 text-xs font-semibold mt-0.5">
            Próxima cita: <strong className="text-slate-900">{patient.nextAppointment || 'Mañana, 09:00 AM'}</strong>
          </div>
        </div>
      </div>

      {/* Z-Pattern Lower Horizontal Bar: Alerts */}
      <div className="pt-3 border-t-2 border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 mr-1 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Alertas Médicas:
        </span>
        {patient.medicalAlerts.map((alert, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-lg text-xs font-black bg-rose-50 text-rose-800 border-2 border-rose-200"
          >
            {alert}
          </span>
        ))}
      </div>
    </div>
  );
};
