import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { MultiViewDentalCanvas } from './MultiViewDentalCanvas';

// ============================================================
//  DIAGNOSTIC PINS — shown per angular zone
// ============================================================
const ALL_PINS = [
  { id: 'bp', x: '30%', y: '14%', color: '#F59E0B', number: '7.9',  label: 'Patología Ósea',         dir: 'down' as const },
  { id: 'cv', x: '62%', y: '18%', color: '#3B82F6', number: '27',   label: 'Caries Activa',           dir: 'down' as const },
  { id: 'im', x: '36%', y: '72%', color: '#10B981', number: '27',   label: 'Implante',                dir: 'up'   as const },
  { id: 'dw', x: '68%', y: '68%', color: '#F43F5E', number: '6.17', label: 'Erosión Dental',          dir: 'up'   as const },
];

// ============================================================
//  CAROUSEL VIEWS — 3 sub-view thumbnails below main canvas
// ============================================================
const CAROUSEL_VIEWS = [
  { src: '/assets/images/dental_view_frontal.jpg',       label: 'Vista Frontal',      neon: '#10B981', nx: '50%',  ny: '45%' },
  { src: '/assets/images/dental_view_occlusal_top.jpg',  label: 'Vista Oclusal',      neon: '#3B82F6', nx: '42%',  ny: '35%' },
  { src: '/assets/images/dental_view_lateral_right.jpg', label: 'Lateral Derecha',    neon: '#F59E0B', nx: '30%',  ny: '30%' },
];

// ============================================================
//  TABS
// ============================================================
const TABS = [
  { id: 'xray',      label: 'Vista Radiográfica' },
  { id: 'tooth',     label: 'Salud Dental' },
  { id: 'ai',        label: 'Analizar con IA', highlight: true },
  { id: 'bone',      label: 'Óseo y Gingival' },
  { id: 'structure', label: 'Estructura y Alineación' },
];

// ============================================================
//  MAIN COMPONENT
// ============================================================
interface Anatomical3DDentitionStudioProps {
  onSelectTooth?: (toothNumber: number) => void;
}

export const Anatomical3DDentitionStudio: React.FC<Anatomical3DDentitionStudioProps> = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [showPins, setShowPins] = useState(true);
  const [carouselStart, setCarouselStart] = useState(0);

  const visibleCarousel = CAROUSEL_VIEWS.slice(carouselStart, carouselStart + 3);

  return (
    <div className="space-y-4">

      {/* ===== SECTION HEADER ===== */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-slate-900">Modelo 3D Interactivo</h3>
          <p className="text-[11px] text-slate-400 font-medium">5 perspectivas unificadas · Arrastra para rotar</p>
        </div>
        <button
          onClick={() => setShowPins((v) => !v)}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all ${showPins ? 'bg-[#1A7B82] text-white border-[#1A7B82]' : 'bg-white text-slate-600 border-slate-200'}`}
        >
          {showPins ? '● Diagnósticos' : '○ Diagnósticos'}
        </button>
      </div>

      {/* ===== MAIN 3D CANVAS (Multi-View WebGL Engine) ===== */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-slate-50">
        <MultiViewDentalCanvas height={400} />

        {/* DIAGNOSTIC PINS overlay — shown on top of WebGL canvas */}
        <AnimatePresence>
          {showPins && ALL_PINS.map((pin) => (
            <motion.div
              key={pin.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.2 }}
              className="absolute flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-200 shadow-xl pointer-events-none z-10"
              style={{ left: pin.x, top: pin.y, transform: 'translate(-50%, -50%)' }}
            >
              <span
                className="w-5 h-5 rounded-full text-white font-black text-[10px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: pin.color }}
              >
                {pin.number}
              </span>
              <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">{pin.label}</span>
              {/* Pointer arrow tip */}
              <span
                className={`absolute ${pin.dir === 'down' ? '-bottom-1.5 border-r border-b' : '-top-1.5 border-l border-t'} left-5 w-3 h-3 bg-white border-slate-200 rotate-45`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ===== DIAGNOSTIC NAVIGATION TABS ===== */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 border-b border-slate-100 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={
              tab.highlight
                ? 'px-4 py-2 rounded-2xl font-extrabold text-white bg-[#1A7B82] shadow-md flex items-center gap-1.5 text-xs'
                : `text-xs font-bold pb-0.5 transition-all ${activeTab === tab.id ? 'text-[#1A7B82] border-b-2 border-[#1A7B82]' : 'text-slate-500 hover:text-slate-800'}`
            }
          >
            {tab.highlight && <Sparkles className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        ))}
        <span className="text-[#1A7B82] font-bold text-xs cursor-pointer hover:underline ml-auto">más &gt;</span>
      </div>

      {/* ===== CAROUSEL: 3 SUB-VIEW CARDS with neon spots ===== */}
      <div className="grid grid-cols-3 gap-3">
        {CAROUSEL_VIEWS.map((view, i) => (
          <motion.div
            key={view.label}
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#1A7B82]/40 cursor-pointer transition-all"
          >
            <div className="h-36 relative overflow-hidden bg-slate-100">
              <img
                src={view.src}
                alt={view.label}
                className="w-full h-full object-cover"
              />
              {/* Neon diagnostic spot */}
              <motion.div
                animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.4, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                className="absolute w-5 h-5 rounded-full pointer-events-none"
                style={{
                  left: view.nx,
                  top: view.ny,
                  backgroundColor: view.neon + '80',
                  boxShadow: `0 0 14px 8px ${view.neon}55`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
              {/* Label badge */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-slate-700 border border-slate-200">
                {view.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ===== PAGINATION & NAV ===== */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`rounded-full transition-all ${i === 1 ? 'w-5 h-2.5 bg-[#1A7B82]' : 'w-2.5 h-2.5 bg-slate-300'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Anterior
          </button>
          <button className="px-5 py-2 bg-[#1A7B82] hover:bg-[#0F766E] text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center gap-1">
            Siguiente <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
