import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus
} from 'lucide-react';
import type { CalendarViewMode } from '../../types/database';

interface HeaderProps {
  currentDateText: string;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateText,
  viewMode,
  onViewModeChange,
  onToday,
  onPrev,
  onNext,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
}) => {
  return (
    <header className="h-14 md:h-18 bg-white border-b border-slate-100 px-3 md:px-6 flex items-center justify-between gap-2 sticky top-0 z-30 select-none shadow-2xs">
      {/* Left: Official Company Logo + Date Navigation */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
        {/* Company Logo */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0">
          <img 
            src="/logo.svg" 
            alt="Liberal Logo" 
            className="w-7 h-7 md:w-9 md:h-9 object-contain drop-shadow-xs"
          />
          <div className="hidden lg:block">
            <h1 className="font-extrabold text-xs tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              LIBERAL <span className="text-[10px] font-bold text-blue-600 px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-100">CALENDAR</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Lịch điều phối công ty</p>
          </div>
        </div>

        {/* Date Navigation Controls */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <button
            onClick={onToday}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors hidden sm:block shrink-0"
          >
            Hôm nay
          </button>

          <div className="flex items-center bg-slate-100/90 rounded-xl p-0.5 border border-slate-200/60 shrink-0">
            <button
              onClick={onPrev}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Trước"
            >
              <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={onNext}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Sau"
            >
              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>

          {/* Clean Prominent Date Display */}
          <span className="font-black text-xs sm:text-sm md:text-base text-slate-900 tracking-tight capitalize truncate">
            {currentDateText}
          </span>
        </div>
      </div>

      {/* Middle: Center Search Input (Desktop only) */}
      <div className="hidden xl:flex items-center flex-1 max-w-xs relative">
        <input
          type="text"
          placeholder="Tìm tiêu đề, địa điểm..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 rounded-full border border-slate-200/80 bg-slate-50/80 focus:bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
      </div>

      {/* Right: View Switcher + Action Buttons */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        {/* View Mode Switcher Pills */}
        <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-bold text-slate-600 border border-slate-200/60">
          <button
            onClick={() => onViewModeChange('timeGridDay')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'timeGridDay'
                ? 'bg-white text-blue-600 font-extrabold shadow-xs border border-slate-200/60'
                : 'hover:text-slate-900'
            }`}
          >
            Ngày
          </button>
          <button
            onClick={() => onViewModeChange('timeGridWeek')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'timeGridWeek'
                ? 'bg-white text-blue-600 font-extrabold shadow-xs border border-slate-200/60'
                : 'hover:text-slate-900'
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => onViewModeChange('dayGridMonth')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'dayGridMonth'
                ? 'bg-white text-blue-600 font-extrabold shadow-xs border border-slate-200/60'
                : 'hover:text-slate-900'
            }`}
          >
            Tháng
          </button>
          <button
            onClick={() => onViewModeChange('listUpcoming')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'listUpcoming'
                ? 'bg-white text-blue-600 font-extrabold shadow-xs border border-slate-200/60'
                : 'hover:text-slate-900'
            }`}
          >
            Danh sách
          </button>
        </div>

        {/* Desktop "+ Thêm lịch" Button */}
        <button
          onClick={onOpenCreateModal}
          className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Thêm lịch</span>
        </button>
      </div>
    </header>
  );
};
