import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle2, AlertCircle, Filter } from 'lucide-react';

interface SidebarProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onOpenCreateModal: () => void;
  totalEventsCount: number;
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  statusFilter,
  onStatusFilterChange,
  onOpenCreateModal,
  totalEventsCount,
  scheduledCount,
  inProgressCount,
  completedCount,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white border-r border-slate-100 p-3.5 flex flex-col justify-between h-full select-none shrink-0 hidden md:flex transition-all duration-300 ease-in-out z-20 shadow-xs ${
        isHovered ? 'w-60 shadow-lg' : 'w-[68px]'
      }`}
    >
      <div className="space-y-6">
        {/* Top "+ TẠO LỊCH MỚI" Button */}
        <button
          onClick={onOpenCreateModal}
          className={`rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-blue-500/20 transition-all uppercase tracking-wide overflow-hidden ${
            isHovered ? 'w-full py-2.5 px-4 gap-2' : 'w-11 h-11 mx-auto'
          }`}
          title="Tạo lịch mới"
        >
          <Plus className="w-5 h-5 stroke-[3] shrink-0" />
          {isHovered && <span className="whitespace-nowrap transition-opacity duration-300">TẠO LỊCH MỚI</span>}
        </button>

        {/* Section Header: "TRẠNG THÁI CÔNG VIỆC" */}
        <div className="space-y-2">
          <div className={`flex items-center gap-2 px-1 ${isHovered ? '' : 'justify-center'}`} title="Trạng thái công việc">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {isHovered && (
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap transition-opacity duration-300">
                TRẠNG THÁI CÔNG VIỆC
              </span>
            )}
          </div>

          {/* List of Status Items */}
          <div className="space-y-1 text-xs font-semibold">
            {/* 1. Tất cả công việc */}
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`rounded-xl text-left flex items-center transition-all ${
                isHovered ? 'w-full px-3 py-2.5 justify-between' : 'w-11 h-11 justify-center mx-auto'
              } ${
                statusFilter === 'all'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Tất cả công việc"
            >
              <div className="flex items-center gap-2.5 shrink-0">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                {isHovered && <span className="whitespace-nowrap">Tất cả công việc</span>}
              </div>
              {isHovered ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  statusFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {totalEventsCount}
                </span>
              ) : (
                statusFilter === 'all' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute right-2" />
                )
              )}
            </button>

            {/* 2. Chưa diễn ra */}
            <button
              onClick={() => onStatusFilterChange('scheduled')}
              className={`rounded-xl text-left flex items-center transition-all ${
                isHovered ? 'w-full px-3 py-2.5 justify-between' : 'w-11 h-11 justify-center mx-auto'
              } ${
                statusFilter === 'scheduled'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Chưa diễn ra"
            >
              <div className="flex items-center gap-2.5 shrink-0">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                {isHovered && <span className="whitespace-nowrap">Chưa diễn ra</span>}
              </div>
              {isHovered && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                  {scheduledCount}
                </span>
              )}
            </button>

            {/* 3. Đang diễn ra */}
            <button
              onClick={() => onStatusFilterChange('in_progress')}
              className={`rounded-xl text-left flex items-center transition-all ${
                isHovered ? 'w-full px-3 py-2.5 justify-between' : 'w-11 h-11 justify-center mx-auto'
              } ${
                statusFilter === 'in_progress'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Đang diễn ra"
            >
              <div className="flex items-center gap-2.5 shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                {isHovered && <span className="whitespace-nowrap">Đang diễn ra</span>}
              </div>
              {isHovered && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                  {inProgressCount}
                </span>
              )}
            </button>

            {/* 4. Đã hoàn thành */}
            <button
              onClick={() => onStatusFilterChange('completed')}
              className={`rounded-xl text-left flex items-center transition-all ${
                isHovered ? 'w-full px-3 py-2.5 justify-between' : 'w-11 h-11 justify-center mx-auto'
              } ${
                statusFilter === 'completed'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Đã hoàn thành"
            >
              <div className="flex items-center gap-2.5 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {isHovered && <span className="whitespace-nowrap">Đã hoàn thành</span>}
              </div>
              {isHovered && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                  {completedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
