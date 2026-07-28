import React from 'react';
import type { CalendarEvent } from '../../types/database';
import { Clock, MapPin, Video, MoreVertical, Calendar as CalendarIcon, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DayViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onSelectEvent: (event: CalendarEvent) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  events,
  currentDate,
  onSelectEvent,
  onToday,
  onPrev,
  onNext,
}) => {
  const dateSub = format(currentDate, 'EEEE, dd/MM/yyyy', { locale: vi });

  // Sorted time events
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  );

  // Pastel accent styles for events
  const colorVariants = [
    { border: 'border-l-blue-600', bg: 'bg-blue-50/40', text: 'text-blue-600', tagBg: 'bg-blue-50 text-blue-700 border-blue-100' },
    { border: 'border-l-purple-600', bg: 'bg-purple-50/40', text: 'text-purple-600', tagBg: 'bg-purple-50 text-purple-700 border-purple-100' },
    { border: 'border-l-amber-500', bg: 'bg-amber-50/40', text: 'text-amber-600', tagBg: 'bg-amber-50 text-amber-700 border-amber-100' },
    { border: 'border-l-green-600', bg: 'bg-green-50/40', text: 'text-green-600', tagBg: 'bg-green-50 text-green-700 border-green-100' },
  ];

  return (
    <div className="h-full w-full p-3 sm:p-4 md:p-6 overflow-y-auto select-none bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-5">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 leading-tight">
              Lịch ngày
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-bold capitalize mt-0.5">
              {dateSub}
            </p>
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToday}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            Hôm nay
          </button>
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/60">
            <button
              onClick={onPrev}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Day Events Cards Timeline */}
      {sortedEvents.length === 0 ? (
        <div className="py-16 text-center space-y-2 text-slate-400">
          <CalendarIcon className="w-8 h-8 mx-auto stroke-1" />
          <p className="text-xs font-bold text-slate-500">Không có lịch công việc nào trong ngày này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map((evt, index) => {
            const startDate = parseISO(evt.start_at);
            const endDate = parseISO(evt.end_at);
            const color = colorVariants[index % colorVariants.length];

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className={`p-4 md:p-5 rounded-2xl border border-slate-100 border-l-4 ${color.border} ${color.bg} hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 group`}
              >
                {/* Left: Prominent Time Range */}
                <div className="w-full sm:w-36 shrink-0 space-y-0.5">
                  <div className={`font-black text-sm md:text-base ${color.text} flex items-center gap-1`}>
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{format(startDate, 'HH:mm')}</span>
                    <span className="text-slate-400 font-bold text-xs">– {format(endDate, 'HH:mm')}</span>
                  </div>
                </div>

                {/* Center Details */}
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-sm md:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    {evt.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-semibold">
                    {evt.location && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span>{evt.location}</span>
                      </span>
                    )}

                    {evt.meeting_url && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Monitor className="w-3.5 h-3.5 text-slate-400" />
                          <span>Online</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <a
                          href={evt.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-blue-600 hover:underline font-bold"
                        >
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                          <span>Google Meet</span>
                        </a>
                      </>
                    )}
                  </div>

                  <div className="pt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${color.tagBg}`}>
                      {evt.tag || 'Họp hành'}
                    </span>
                  </div>
                </div>

                {/* Right: Menu Button */}
                <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(evt);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
