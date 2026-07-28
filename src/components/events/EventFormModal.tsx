import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, MapPin, Video, FileText } from 'lucide-react';
import type { CalendarEvent, EventFormData } from '../../types/database';
import { format } from 'date-fns';

const eventFormSchema = z.object({
  title: z.string().min(2, 'Tiêu đề phải từ 2 ký tự trở lên'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  start_time: z.string().min(1, 'Vui lòng chọn giờ bắt đầu'),
  end_date: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  end_time: z.string().min(1, 'Vui lòng chọn giờ kết thúc'),
  location: z.string().optional(),
  meeting_url: z.string().optional(),
  tag: z.string().optional(),
});

type EventFormInputs = z.infer<typeof eventFormSchema>;

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  initialEvent?: CalendarEvent | null;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialEvent,
  defaultStartDate,
  defaultEndDate,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormInputs>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '09:00',
      end_date: format(new Date(), 'yyyy-MM-dd'),
      end_time: '10:00',
      location: '',
      meeting_url: '',
      tag: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialEvent) {
        const start = new Date(initialEvent.start_at);
        const end = new Date(initialEvent.end_at);
        reset({
          title: initialEvent.title,
          description: initialEvent.description || '',
          start_date: format(start, 'yyyy-MM-dd'),
          start_time: format(start, 'HH:mm'),
          end_date: format(end, 'yyyy-MM-dd'),
          end_time: format(end, 'HH:mm'),
          location: initialEvent.location || '',
          meeting_url: initialEvent.meeting_url || '',
          tag: initialEvent.tag || '',
        });
      } else {
        const now = new Date();
        reset({
          title: '',
          description: '',
          start_date: defaultStartDate ? format(new Date(defaultStartDate), 'yyyy-MM-dd') : format(now, 'yyyy-MM-dd'),
          start_time: defaultStartDate && defaultStartDate.includes('T') ? format(new Date(defaultStartDate), 'HH:mm') : '09:00',
          end_date: defaultEndDate ? format(new Date(defaultEndDate), 'yyyy-MM-dd') : format(now, 'yyyy-MM-dd'),
          end_time: defaultEndDate && defaultEndDate.includes('T') ? format(new Date(defaultEndDate), 'HH:mm') : '10:00',
          location: '',
          meeting_url: '',
          tag: '',
        });
      }
    }
  }, [isOpen, initialEvent, defaultStartDate, defaultEndDate, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: EventFormInputs) => {
    await onSubmit({
      ...data,
      all_day: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {initialEvent ? 'Chỉnh Sửa Lịch Công Việc' : 'Tạo Lịch Công Việc Mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề công việc <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tiêu đề cuộc họp, công việc..."
              {...register('title')}
              className="w-full px-3.5 py-2 rounded-xl ui-input text-xs"
              autoFocus
            />
            {errors.title && (
              <p className="text-red-500 text-[11px] mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full px-3 py-2 rounded-xl ui-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                {...register('start_time')}
                className="w-full px-3 py-2 rounded-xl ui-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                {...register('end_date')}
                className="w-full px-3 py-2 rounded-xl ui-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giờ kết thúc
              </label>
              <input
                type="time"
                {...register('end_time')}
                className="w-full px-3 py-2 rounded-xl ui-input text-xs"
              />
            </div>
          </div>

          {/* Location & Tag Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Địa điểm tổ chức</span>
              </label>
              <input
                type="text"
                placeholder="VD: Phòng họp Tầng 3"
                {...register('location')}
                className="w-full px-3.5 py-2 rounded-xl ui-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Nhãn loại việc (Tag)</span>
              </label>
              <input
                type="text"
                placeholder="VD: Họp hành, Deadline, Sự kiện"
                {...register('tag')}
                className="w-full px-3.5 py-2 rounded-xl ui-input text-xs"
              />
            </div>
          </div>

          {/* Meeting URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-slate-400" />
              <span>Link họp Online (Google Meet, Zoom...)</span>
            </label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              {...register('meeting_url')}
              className="w-full px-3.5 py-2 rounded-xl ui-input text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Ghi chú bổ sung</span>
            </label>
            <textarea
              rows={3}
              placeholder="Nội dung chi tiết, chuẩn bị tài liệu..."
              {...register('description')}
              className="w-full px-3.5 py-2 rounded-xl ui-input text-xs resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : initialEvent ? 'Cập Nhật Lịch' : 'Tạo Lịch Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
