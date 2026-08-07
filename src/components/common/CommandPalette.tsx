import React, { useEffect, useState } from 'react';
import { Search, Command, Stethoscope, Calendar, User, FileText, Printer, Zap } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string, param?: number) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectAction }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectAction('open_cmd');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectAction]);

  if (!isOpen) return null;

  const COMMAND_ITEMS = [
    { id: 'tooth-55', label: 'Diente FDI 55 - Segundo Molar Leche (Superior)', type: 'diente', toothNum: 55 },
    { id: 'tooth-54', label: 'Diente FDI 54 - Primer Molar Leche (Superior)', type: 'diente', toothNum: 54 },
    { id: 'tooth-16', label: 'Diente FDI 16 - Primer Molar Permanente (Superior)', type: 'diente', toothNum: 16 },
    { id: 'tooth-74', label: 'Diente FDI 74 - Primer Molar Leche (Inferior)', type: 'diente', toothNum: 74 },
    { id: 'tooth-85', label: 'Diente FDI 85 - Segundo Molar Leche (Inferior)', type: 'diente', toothNum: 85 },
    { id: 'nav-odontogram', label: 'Ver Odontograma FDI Interactivo', type: 'accion', category: 'Navegación' },
    { id: 'nav-patient', label: 'Ver Expediente Clínico de Mateo Silva', type: 'accion', category: 'Navegación' },
    { id: 'nav-appointments', label: 'Abrir Agenda y Turnos en Sillón', type: 'accion', category: 'Navegación' },
    { id: 'action-print', label: 'Imprimir Odontograma en PDF', type: 'accion', category: 'Reporte' },
  ];

  const filteredItems = COMMAND_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden space-y-0">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200/80 gap-3">
          <Search className="w-5 h-5 text-[#1A7B82]" />
          <input
            type="text"
            autoFocus
            placeholder="Escribe un comando o número de diente FDI (ej: 55, 16, cita)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent border-none outline-hidden text-slate-800 placeholder-slate-400 font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-extrabold text-slate-400 bg-slate-100 rounded-md border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No se encontraron coincidencias para "{query}".
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.toothNum) {
                    onSelectAction('select_tooth', item.toothNum);
                  } else {
                    onSelectAction(item.id);
                  }
                  onClose();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#E6F4F1] hover:text-[#0F766E] text-slate-700 text-xs font-semibold flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  {item.type === 'diente' ? (
                    <span className="w-7 h-7 rounded-lg bg-teal-50 text-[#1A7B82] border border-[#1A7B82]/30 flex items-center justify-center font-bold text-xs group-hover:bg-[#1A7B82] group-hover:text-white">
                      {item.toothNum}
                    </span>
                  ) : (
                    <Zap className="w-4 h-4 text-[#1A7B82]" />
                  )}
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#0F766E] uppercase tracking-wider">
                  {item.type === 'diente' ? 'FDI Tooth' : item.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5" /> Presiona <strong>Cmd + K</strong> en cualquier lugar para buscar
          </span>
          <span>Oral & Kids Command Engine</span>
        </div>
      </div>
    </div>
  );
};
