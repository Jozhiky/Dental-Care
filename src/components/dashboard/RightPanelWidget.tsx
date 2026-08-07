import React, { useState } from 'react';
import { Bot, Calendar, FileText, Send, Sparkles, Plus, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export const RightPanelWidget: React.FC = () => {
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'La preparación puede variar según el procedimiento. Por ejemplo, es posible que deba evitar ciertos alimentos antes de una extracción dental.',
    },
  ]);

  const [notes, setNotes] = useState([
    'Pasta Fluorada - Usar 2 veces al día. Cita de Obturación Dental',
    'Múltiples caries detectadas en molares; erosión leve de esmalte observada.',
  ]);
  const [newNote, setNewNote] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatMessage('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Entendido. Se añade recomendación de profilaxis y aplicación de sellante preventivo en molares.',
        },
      ]);
    }, 600);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [newNote, ...prev]);
    setNewNote('');
  };

  return (
    <div className="space-y-4">
      {/* HEALTH GPT CARD (Replicating Image 2 Health GPT Widget Exactly) */}
      <div className="futuristic-card p-4 bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 font-outfit">Asistente Dental IA</h3>
            <p className="text-[10px] text-slate-400 font-medium">Tu asistente de IA para consultas clínicas rápidas y soporte odontológico.</p>
          </div>
          <span className="text-[10px] font-bold text-slate-400">∧</span>
        </div>

        {/* Chat History */}
        <div className="space-y-2 max-h-[160px] overflow-y-auto text-xs p-1">
          <div className="text-[10px] text-[#1A7B82] font-semibold">
            Agente de Atención transfiere información al Agente de Agenda
          </div>

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-[#1A7B82] text-white ml-6 text-right font-medium'
                  : 'bg-slate-50 text-slate-700 border border-slate-200/80 mr-4'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Suggestion Action Pills (Image 2 Buttons) */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button className="px-2.5 py-1.5 text-[11px] font-bold bg-[#E6F4F1] text-[#0F766E] rounded-xl border border-[#1A7B82]/20 hover:bg-[#1A7B82] hover:text-white transition-all">
            Cuidados Post-Tratamiento
          </button>
          <button className="px-2.5 py-1.5 text-[11px] font-bold bg-[#E6F4F1] text-[#0F766E] rounded-xl border border-[#1A7B82]/20 hover:bg-[#1A7B82] hover:text-white transition-all">
            Agendar Cita
          </button>
          <button className="px-2.5 py-1.5 text-[11px] font-bold bg-[#E6F4F1] text-[#0F766E] rounded-xl border border-[#1A7B82]/20 hover:bg-[#1A7B82] hover:text-white transition-all">
            Historial Clínico
          </button>
          <button className="px-2.5 py-1.5 text-[11px] font-bold bg-[#E6F4F1] text-[#0F766E] rounded-xl border border-[#1A7B82]/20 hover:bg-[#1A7B82] hover:text-white transition-all">
            Procedimientos Dentales
          </button>
        </div>

        {/* Chat Input & Send Button */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Escribe tu consulta aquí..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1A7B82] outline-hidden"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#1A7B82] hover:bg-[#0F766E] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1"
          >
            Enviar
          </button>
        </form>

        {/* AI Suggests Box (Replicating Image 2 AI Suggests Box) */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-900">IA Sugiere</span>
            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Con IA</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800">1. Programar Profilaxis</span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Urgente</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800">2. Obturar Caries</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Próximo</span>
            </div>
          </div>

          <button className="w-full py-2 bg-[#1A7B82] hover:bg-[#0F766E] text-white text-xs font-black rounded-xl shadow-md transition-all">
            Reservar Ahora →
          </button>
        </div>
      </div>

      {/* YOUR SCHEDULE CALENDAR CARD (Replicating Image 1 Schedule) */}
      <div className="futuristic-card p-4 bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
            Mi Agenda
          </h3>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Octubre 2026</span>
            <button className="p-0.5 hover:bg-slate-100 rounded"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="p-0.5 hover:bg-slate-100 rounded"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="p-3 bg-[#E6F4F1] rounded-2xl border border-[#1A7B82]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1A7B82]" />
            <div>
              <div className="font-bold text-slate-900">Reunión Médica Mensual</div>
              <div className="text-[10px] text-slate-500">12 Octubre, 2026 | 08:00 p.m.</div>
            </div>
          </div>
        </div>
      </div>

      {/* DENTIST NOTES CARD WITH 3D ROBOT TOOTH MASCOT (Replicating Image 1 Dentist Notes) */}
      <div className="futuristic-card p-4 bg-white space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
            Notas del Odontólogo
          </h3>
          <button
            onClick={handleAddNote}
            className="px-2.5 py-1 text-[11px] font-bold bg-[#E6F4F1] text-[#0F766E] rounded-xl border border-[#1A7B82]/30 flex items-center gap-1 hover:bg-[#1A7B82] hover:text-white transition-all"
          >
            <Plus className="w-3 h-3" /> + Agregar nota
          </button>
        </div>

        {/* 3D Robot Tooth Mascot Asset Embedded (Image 1 Notes Mascot) */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
            <img src="/assets/images/3d_tooth_mascot.jpg" alt="3D Robot Tooth Mascot" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-900">Asistente de Notas IA</div>
            <p className="text-[11px] text-slate-500 font-medium">Sincronización automática de resumen clínico activa para Mateo Silva.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
