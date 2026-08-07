import React from 'react';
import {
  Stethoscope,
  UserCheck,
  Calendar,
  History,
  Search,
  Bell,
  ShieldCheck,
  Command,
  LayoutDashboard,
  Plus,
} from 'lucide-react';
import { PediatricPatient } from '../../types/odontogram';

interface SidebarLayoutProps {
  activeTab: 'dashboard' | 'odontogram' | 'appointments' | 'patient' | 'history';
  onTabChange: (tab: 'dashboard' | 'odontogram' | 'appointments' | 'patient' | 'history') => void;
  activePatient: PediatricPatient;
  onOpenCmd: () => void;
  children: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  activeTab,
  onTabChange,
  activePatient,
  onOpenCmd,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex font-sans text-slate-800 p-3 gap-3">
      {/* MintDen / Denty ai Inspired Slim Icon Sidebar */}
      <aside className="w-16 slim-sidebar flex flex-col items-center justify-between py-4 sticky top-3 h-[calc(100vh-1.5rem)] z-30 no-print shrink-0 bg-white">
        <div className="flex flex-col items-center gap-4">
          {/* Logo Badge */}
          <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] p-1 border border-[#1A7B82]/30 flex items-center justify-center shadow-xs">
            <img
              src="/assets/branding/logo.png"
              alt="Oral & Kids"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="w-8 h-px bg-slate-100 my-1" />

          {/* Icon Navigation Stack */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => onTabChange('dashboard')}
              title="Dashboard MintDen"
              className={`slim-icon-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>

            <button
              onClick={() => onTabChange('odontogram')}
              title="Odontograma FDI Denty ai"
              className={`slim-icon-btn ${activeTab === 'odontogram' ? 'active' : ''}`}
            >
              <Stethoscope className="w-5 h-5" />
            </button>

            <button
              onClick={() => onTabChange('patient')}
              title="Expediente Clínico"
              className={`slim-icon-btn ${activeTab === 'patient' ? 'active' : ''}`}
            >
              <UserCheck className="w-5 h-5" />
            </button>

            <button
              onClick={() => onTabChange('appointments')}
              title="Agenda de Citas"
              className={`slim-icon-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            >
              <Calendar className="w-5 h-5" />
            </button>

            <button
              onClick={() => onTabChange('history')}
              title="Historial Timeline"
              className={`slim-icon-btn ${activeTab === 'history' ? 'active' : ''}`}
            >
              <History className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Doctor Avatar & Command Trigger */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onOpenCmd}
            title="Abrir Comandos (Cmd + K)"
            className="slim-icon-btn text-[#1A7B82] bg-slate-50 border border-slate-200"
          >
            <Command className="w-4 h-4" />
          </button>

          <div className="w-9 h-9 rounded-2xl bg-[#1A7B82] text-white font-black text-xs flex items-center justify-center shadow-xs" title="Dra. Elena Alarcón (Sede Lima)">
            EA
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 space-y-3">
        {/* DENTY AI TOP HEADER BAR (Replicating Image 1 Top Header) */}
        <header className="h-14 futuristic-card px-4 flex items-center justify-between sticky top-3 z-20 no-print shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-black text-slate-900 font-outfit tracking-tight">
              Oral & Kids <span className="text-[#1A7B82] text-xs font-bold ml-1">Dental Care</span>
            </h1>

            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-700 rounded-full">Funciones</span>
              <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-700 rounded-full">Aprendizaje</span>
            </div>
          </div>

          {/* Denty ai Search Bar Inputs */}
          <div className="w-2/5">
            <button
              onClick={onOpenCmd}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-400 flex items-center justify-between hover:border-[#1A7B82] transition-all"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>¿Qué diente o cuadrante buscar? (Cmd + K)...</span>
              </span>
              <kbd className="px-1.5 py-0.5 text-[9px] bg-white text-slate-400 rounded border border-slate-200 font-mono">Cmd+K</kbd>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCmd}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center relative hover:bg-slate-200 transition-all">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-1 right-1" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#1A7B82] text-white font-black text-xs flex items-center justify-center">
                EA
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none">Dra. Elena Alarcón</div>
                <div className="text-[10px] text-[#1A7B82] font-semibold mt-0.5">Odontopediatra Lead</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content View Container */}
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col space-y-2">
          {children}
        </main>
      </div>
    </div>
  );
};
