import React, { useState } from 'react';
import { User, Check } from 'lucide-react';

interface MemberNamePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => void;
}

export const MemberNamePromptModal: React.FC<MemberNamePromptModalProps> = ({
  isOpen,
  onClose,
  currentName,
  onSave,
}) => {
  const [nameInput, setNameInput] = useState(currentName || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSave(nameInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Nhập Tên Hiển Thị Của Bạn
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Vui lòng nhập tên của bạn để đồng đội biết ai là người tạo hoặc cập nhật lịch công việc này.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <input
              type="text"
              placeholder="VD: Nguyễn Văn A, Phạm Uyển Chân..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl ui-input text-xs text-center font-semibold"
              autoFocus
            />

            <div className="flex items-center gap-2 pt-2">
              {currentName && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Đóng
                </button>
              )}
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Xác nhận Tên</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
