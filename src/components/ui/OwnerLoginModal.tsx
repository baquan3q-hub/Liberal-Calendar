import React, { useState } from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => Promise<boolean>;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await onLogin(password);
    setLoading(false);

    if (!success) {
      setError('Mật khẩu quản trị viên không chính xác. Thử lại (vd: liberal2026 hoặc admin123)');
    } else {
      setPassword('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Đăng Nhập Quản Trị Viên (Owner)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Quyền Người sở hữu (Owner) cho phép bạn khôi phục lịch đã xóa và xem toàn bộ nhật ký thao tác audit trail.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu Admin / Owner
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Nhập mật khẩu (Mặc định: liberal2026)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl ui-input text-xs"
                autoFocus
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            {error && (
              <p className="text-red-500 text-[11px] mt-1.5 leading-tight">{error}</p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Đăng Nhập Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
