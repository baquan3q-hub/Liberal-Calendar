import React from 'react';
import type { CalendarEvent } from '../../types/database';
import { X, RotateCcw, Trash2, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DeletedEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedEvents: CalendarEvent[];
  onRestore: (id: string) => Promise<void>;
}

export const DeletedEventsModal: React.FC<DeletedEventsModalProps> = ({
  isOpen,
  onClose,
  deletedEvents,
  onRestore,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Quản Lý Sự Kiện Đã Xóa ({deletedEvents.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto divide-y divide-slate-100">
          {deletedEvents.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              Không có sự kiện nào trong thùng rác.
            </p>
          ) : (
            deletedEvents.map((evt) => {
              const startDate = parseISO(evt.start_at);
              return (
                <div key={evt.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {format(startDate, 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRestore(evt.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
