import React from 'react';
import { CalendarDays, CalendarRange, Plus } from 'lucide-react';
import type { CalendarViewMode } from '../../types/database';

interface MobileNavProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onOpenCreateModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  viewMode,
  onViewModeChange,
  onOpenCreateModal,
}) => {
  const isListView = viewMode === 'listUpcoming';
  const isCalendarView = viewMode === 'timeGridWeek' || viewMode === 'dayGridMonth' || viewMode === 'timeGridDay';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 border-t border-slate-200/90 backdrop-blur-md px-10 flex items-center justify-between z-40 shadow-lg select-none">
      {/* 1. Left Shortcut: "Lịch trình" (Default Home View) */}
      <button
        onClick={() => onViewModeChange('listUpcoming')}
        className={`flex flex-col items-center gap-1 transition-all ${
          isListView
            ? 'text-blue-600 font-black scale-105'
            : 'text-slate-500 hover:text-slate-800 font-semibold'
        }`}
      >
        <CalendarDays className="w-5 h-5" />
        <span className="text-[11px] tracking-tight">Lịch trình</span>
      </button>

      {/* 2. Center: EXTRA LARGE Floating "+ Thêm lịch" Button */}
      <button
        onClick={onOpenCreateModal}
        className="-mt-7 w-15 h-15 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/35 font-extrabold active:scale-95 transition-transform border-4 border-white"
        title="Tạo lịch mới"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* 3. Right Shortcut: "Xem lịch (Tuần & Tháng)" */}
      <button
        onClick={() => {
          // If already in week view, switch to month view for convenience, else switch to week view
          if (viewMode === 'timeGridWeek') {
            onViewModeChange('dayGridMonth');
          } else {
            onViewModeChange('timeGridWeek');
          }
        }}
        className={`flex flex-col items-center gap-1 transition-all ${
          isCalendarView
            ? 'text-blue-600 font-black scale-105'
            : 'text-slate-500 hover:text-slate-800 font-semibold'
        }`}
      >
        <CalendarRange className="w-5 h-5" />
        <span className="text-[11px] tracking-tight">
          {viewMode === 'dayGridMonth' ? 'Lịch Tháng' : 'Lịch Tuần'}
        </span>
      </button>
    </nav>
  );
};
