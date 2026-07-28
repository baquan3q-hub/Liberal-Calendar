import React from 'react';
import { Search, Plus, ChevronDown, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarViewMode } from '../../types/database';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onOpenCreateModal: () => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  onOpenCreateModal,
  onToday,
  onPrev,
  onNext,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-4 flex flex-col md:flex-row items-center justify-between gap-3 select-none">
      {/* Left side: View Mode Toggle Tabs */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => onViewModeChange('listUpcoming')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'listUpcoming' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'hover:text-slate-900'
            }`}
          >
            Danh sách
          </button>
          <button
            onClick={() => onViewModeChange('timeGridWeek')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'timeGridWeek' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'hover:text-slate-900'
            }`}
          >
            Lưới Tuần
          </button>
          <button
            onClick={() => onViewModeChange('dayGridMonth')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'dayGridMonth' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'hover:text-slate-900'
            }`}
          >
            Tháng
          </button>
        </div>

        {/* Date Prev/Next Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={onPrev}
            className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors"
            title="Trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className="px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 font-semibold transition-colors"
          >
            Hôm nay
          </button>
          <button
            onClick={onNext}
            className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors"
            title="Sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle: Rounded Search Bar */}
      <div className="flex-1 w-full max-w-md relative">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề, địa điểm hoặc người tạo..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </div>

      {/* Right side: Dropdown + Action Buttons */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Chưa diễn ra</option>
            <option value="in_progress">Đang diễn ra</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        {/* Help Pill button */}
        <button
          className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          title="Quy tắc điều phối"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Giải thích</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>THÊM LỊCH</span>
        </button>
      </div>
    </div>
  );
};
