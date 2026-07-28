import React from 'react';
import type { ActivityLog } from '../../types/database';
import { X, ShieldCheck, PlusCircle, Edit3, Trash2, RotateCcw } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
            <PlusCircle className="w-3 h-3" /> Tạo mới
          </span>
        );
      case 'update':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> Cập nhật
          </span>
        );
      case 'delete':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Đã xóa
          </span>
        );
      case 'restore':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Khôi phục
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Nhật Ký Thao Tác Audit Trail ({logs.length})
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
          {logs.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              Chưa có nhật ký hoạt động nào.
            </p>
          ) : (
            logs.map((log) => {
              const timeStr = format(parseISO(log.created_at), 'HH:mm - dd/MM/yyyy');
              return (
                <div key={log.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="font-bold text-slate-900">{log.event_title || 'Sự kiện'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">{timeStr}</span>
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
