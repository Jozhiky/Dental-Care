import React from 'react';
import { Sparkles, Calendar, UserCheck, ShieldCheck, Stethoscope, Search, Bell } from 'lucide-react';
import { PediatricPatient } from '../../types/odontogram';

interface HeaderProps {
  activePatient: PediatricPatient;
  activeTab: 'odontogram' | 'appointments' | 'patient';
  onTabChange: (tab: 'odontogram' | 'appointments' | 'patient') => void;
}

export const Header: React.FC<HeaderProps> = ({ activePatient, activeTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Section */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-brand-accent p-1.5 border border-brand-primary/20 shadow-xs flex items-center justify-center transition-all group-hover:scale-105">
                <img
                  src="/assets/branding/logo.png"
                  alt="Oral & Kids - Dental Care Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-teal-950 tracking-tight font-outfit">
                  Oral & Kids
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  Dental Care Pediátrico
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Clínica Odontopediátrica de Alta Precisión</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => onTabChange('odontogram')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'odontogram'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Odontograma Pediátrico
            </button>
            <button
              onClick={() => onTabChange('patient')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'patient'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Expediente Clínico
            </button>
            <button
              onClick={() => onTabChange('appointments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'appointments'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Agenda de Citas
            </button>
          </nav>

          {/* Right Specialist Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-slate-900">Dra. Elena Alarcón</span>
              <span className="text-[11px] text-teal-700 font-medium">Odontopediatra Lead</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-xs border-2 border-teal-100">
              EA
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
