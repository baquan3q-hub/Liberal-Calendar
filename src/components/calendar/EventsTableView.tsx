import React, { useState } from 'react';
import type { CalendarEvent } from '../../types/database';
import { format, parseISO } from 'date-fns';
import { MapPin, Video, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface EventsTableViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
}

export const EventsTableView: React.FC<EventsTableViewProps> = ({
  events,
  onSelectEvent,
  onEditEvent,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(events.length / pageSize) || 1;
  const paginatedEvents = events.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedEvents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedEvents.map(e => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Helper status badge styles matching image badges (pink, yellow, gray, blue)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Xin đi muộn / Đang diễn ra
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            Đã hoàn thành
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            Hủy lịch
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Chưa diễn ra
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full select-none">
      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-blue-50/70 border-b border-slate-200 font-bold text-slate-700">
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={paginatedEvents.length > 0 && selectedIds.length === paginatedEvents.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="p-3.5 w-12 text-center font-bold text-slate-500">STT</th>
              <th className="p-3.5 font-bold text-slate-900">Tiêu đề sự kiện</th>
              <th className="p-3.5 font-semibold text-slate-700">Thời gian</th>
              <th className="p-3.5 font-semibold text-slate-700">Địa điểm / Link họp</th>
              <th className="p-3.5 font-semibold text-slate-700">Trạng thái</th>
              <th className="p-3.5 font-semibold text-slate-700">Người tạo</th>
              <th className="p-3.5 text-center font-semibold text-slate-700 w-24">Thao tác</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  Chưa có sự kiện nào được ghi nhận.
                </td>
              </tr>
            ) : (
              paginatedEvents.map((evt, idx) => {
                const stt = (currentPage - 1) * pageSize + idx + 1;
                const startDate = parseISO(evt.start_at);
                const endDate = parseISO(evt.end_at);
                const timeStr = `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}, ${format(startDate, 'dd/MM/yyyy')}`;

                return (
                  <tr
                    key={evt.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectEvent(evt)}
                  >
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(evt.id)}
                        onChange={() => toggleSelect(evt.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5 text-center font-semibold text-slate-500">{stt}</td>
                    <td className="p-3.5 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {evt.title}
                      {evt.description && (
                        <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs mt-0.5">
                          {evt.description}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{timeStr}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-600">
                      {evt.location ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{evt.location}</span>
                        </div>
                      ) : evt.meeting_url ? (
                        <a
                          href={evt.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span>Google Meet</span>
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-3.5">{getStatusBadge(evt.status)}</td>
                    <td className="p-3.5 font-medium text-slate-600">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{(evt as any).created_by_name || 'Hệ thống'}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onEditEvent(evt)}
                        className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition-colors border border-blue-100 shadow-2xs"
                      >
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Hiển thị:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>/{events.length}</span>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-7 h-7 rounded-lg font-semibold text-xs transition-all ${
                currentPage === p
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
