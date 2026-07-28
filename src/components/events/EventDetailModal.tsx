import React, { useState } from 'react';
import type { CalendarEvent } from '../../types/database';
import { X, Calendar as CalendarIcon, MapPin, Video, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface EventDetailModalProps {
  isOpen: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => Promise<void>;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  event,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !event) return null;

  const startDate = parseISO(event.start_at);
  const endDate = parseISO(event.end_at);
  const dateStr = format(startDate, 'EEEE, dd/MM/yyyy', { locale: vi });
  const timeStr = event.all_day
    ? 'Cả ngày'
    : `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;

  const handleDelete = async () => {
    if (confirm(`Bạn có chắc chắn muốn xóa lịch "${event.title}"?`)) {
      setIsDeleting(true);
      await onDelete(event);
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            Chi tiết lịch công việc
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            {event.title}
          </h2>

          <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {/* Date & Time */}
            <div className="flex items-start gap-2.5">
              <CalendarIcon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 capitalize">{dateStr}</p>
                <p className="text-slate-500 font-medium">{timeStr}</p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium text-slate-800">{event.location}</span>
              </div>
            )}

            {/* Meeting Link */}
            {event.meeting_url && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2.5 text-blue-600">
                  <Video className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">Họp trực tuyến</span>
                </div>
                <a
                  href={event.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                >
                  <span>Vào họp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Tag */}
          {event.tag && (
            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                {event.tag}
              </span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700">Mô tả chi tiết:</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa lịch</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(event);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
