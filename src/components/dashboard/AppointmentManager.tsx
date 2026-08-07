import React, { useState } from 'react';
import { ClinicalAppointment } from '../../types/odontogram';
import { Calendar, Clock, CheckCircle2, Plus, Play, User } from 'lucide-react';

const SAMPLE_APPOINTMENTS: ClinicalAppointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1',
    patientName: 'Mateo Silva Gómez',
    time: '09:00 AM',
    date: '2026-08-07',
    type: 'Profilaxis & Sellantes',
    status: 'EN_SILLON',
    dentist: 'Dra. Elena Alarcón (Sillón 1 - Odontopediatría)',
    notes: 'Aplicación de flúor en gel y sellante en 55, 85',
  },
  {
    id: 'apt-2',
    patientId: 'pat-2',
    patientName: 'Camila Torres Ríos',
    time: '10:30 AM',
    date: '2026-08-07',
    type: 'Operatoria (Caries)',
    status: 'PENDIENTE',
    dentist: 'Dra. Elena Alarcón (Sillón 1 - Odontopediatría)',
    notes: 'Tratamiento de caries oclusal en diente 54',
  },
  {
    id: 'apt-3',
    patientId: 'pat-3',
    patientName: 'Lucas Mendoza Benítez',
    time: '11:45 AM',
    date: '2026-08-07',
    type: 'Pulpectomía',
    status: 'PENDIENTE',
    dentist: 'Dr. Carlos Paz (Sillón 2 - Endodoncia)',
    notes: 'Revisión y radiografía coronal en molar 74',
  },
  {
    id: 'apt-4',
    patientId: 'pat-4',
    patientName: 'Sofia Pastrana',
    time: '02:00 PM',
    date: '2026-08-07',
    type: 'Ortopedia Preventiva',
    status: 'FINALIZADA',
    dentist: 'Dra. Elena Alarcón (Sillón 1 - Odontopediatría)',
    notes: 'Control de trampa lingual para hábito de succión digital',
  },
];

export const AppointmentManager: React.FC = () => {
  const [appointments, setAppointments] = useState<ClinicalAppointment[]>(SAMPLE_APPOINTMENTS);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  const [newPatientName, setNewPatientName] = useState('');
  const [newTime, setNewTime] = useState('03:30 PM');
  const [newType, setNewType] = useState<ClinicalAppointment['type']>('Profilaxis & Sellantes');

  const handleStatusChange = (id: string, newStatus: ClinicalAppointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const newApt: ClinicalAppointment = {
      id: `apt-${Date.now()}`,
      patientId: `pat-${Date.now()}`,
      patientName: newPatientName,
      time: newTime,
      date: new Date().toISOString().split('T')[0],
      type: newType,
      status: 'PENDIENTE',
      dentist: 'Dra. Elena Alarcón (Sillón 1)',
      notes: 'Cita agendada desde recepción',
    };

    setAppointments((prev) => [...prev, newApt]);
    setShowNewModal(false);
    setNewPatientName('');
  };

  const sillom1Apts = appointments.filter((a) => a.dentist.includes('Sillón 1'));
  const sillom2Apts = appointments.filter((a) => a.dentist.includes('Sillón 2'));

  return (
    <div className="space-y-4">
      {/* Control Header */}
      <div className="clean-card p-4 bg-white border-l-4 border-l-[#1A7B82] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1A7B82]" />
            Agenda Clínica Organizada por Sillones de Atención
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Control de citas en tiempo real para Sillón 1 (Odontopediatría) y Sillón 2 (Especialidades).
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 text-xs font-bold bg-[#1A7B82] hover:bg-[#0F766E] text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Agendar Nueva Cita
        </button>
      </div>

      {/* Grid of Chairs (Sillones Clínicos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sillón 1 - Odontopediatría */}
        <div className="clean-card p-4 space-y-3 bg-white border-t-4 border-t-[#1A7B82]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sillón 1 - Odontopediatría (Dra. Elena Alarcón)
            </h3>
            <span className="text-[10px] font-bold text-[#0F766E] bg-[#E6F4F1] px-2 py-0.5 rounded-full border border-[#1A7B82]/20">
              {sillom1Apts.length} Citas
            </span>
          </div>

          <div className="space-y-3">
            {sillom1Apts.map((apt) => (
              <div key={apt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A7B82] bg-white px-2 py-0.5 rounded border border-slate-200">
                    {apt.time}
                  </span>
                  {apt.status === 'EN_SILLON' && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                      En Sillón Activo
                    </span>
                  )}
                  {apt.status === 'PENDIENTE' && (
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                      En Espera
                    </span>
                  )}
                  {apt.status === 'FINALIZADA' && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                      Finalizada
                    </span>
                  )}
                </div>

                <div className="font-bold text-sm text-slate-900">{apt.patientName}</div>
                <div className="text-xs font-semibold text-[#1A7B82]">{apt.type}</div>
                <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">{apt.notes}</p>

                <div className="flex justify-end gap-1 pt-1">
                  {apt.status !== 'EN_SILLON' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'EN_SILLON')}
                      className="px-3 py-1 bg-amber-600 text-white font-bold text-xs rounded-lg"
                    >
                      Ingresar a Sillón
                    </button>
                  )}
                  {apt.status !== 'FINALIZADA' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'FINALIZADA')}
                      className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg"
                    >
                      Finalizar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sillón 2 - Especialidades */}
        <div className="clean-card p-4 space-y-3 bg-white border-t-4 border-t-slate-700">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sillón 2 - Especialidades (Dr. Carlos Paz)
            </h3>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {sillom2Apts.length} Cita
            </span>
          </div>

          <div className="space-y-3">
            {sillom2Apts.map((apt) => (
              <div key={apt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A7B82] bg-white px-2 py-0.5 rounded border border-slate-200">
                    {apt.time}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    En Espera
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-900">{apt.patientName}</div>
                <div className="text-xs font-semibold text-[#1A7B82]">{apt.type}</div>
                <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">{apt.notes}</p>

                <div className="flex justify-end gap-1 pt-1">
                  <button
                    onClick={() => handleStatusChange(apt.id, 'EN_SILLON')}
                    className="px-3 py-1 bg-amber-600 text-white font-bold text-xs rounded-lg"
                  >
                    Ingresar a Sillón
                  </button>
                  <button
                    onClick={() => handleStatusChange(apt.id, 'FINALIZADA')}
                    className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Nueva Cita */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleAddAppointment}
            className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Agendar Cita en Sillón Clínico</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo del Paciente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gabriel Ruiz"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:border-[#1A7B82] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hora de Atención</label>
                <input
                  type="text"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:border-[#1A7B82] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Procedimiento</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ClinicalAppointment['type'])}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:border-[#1A7B82] outline-hidden"
                >
                  <option value="Valoración Inicial">Valoración Inicial</option>
                  <option value="Profilaxis & Sellantes">Profilaxis & Sellantes</option>
                  <option value="Operatoria (Caries)">Operatoria (Caries)</option>
                  <option value="Pulpectomía">Pulpectomía</option>
                  <option value="Ortopedia Preventiva">Ortopedia Preventiva</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#1A7B82] hover:bg-[#0F766E] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirmar Cita
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
