import React from 'react';
import type { CalendarEvent } from '../../types/database';
import { 
  MapPin, 
  Video, 
  MoreVertical, 
  Calendar as CalendarIcon, 
  ArrowUpDown,
  Monitor
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface UpcomingListProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenCreateModal: () => void;
}

export const UpcomingList: React.FC<UpcomingListProps> = ({
  events,
  onSelectEvent,
}) => {
  // Sort events by start date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  );

  // Group events by day label
  const groupedEvents: Record<string, CalendarEvent[]> = {};
  sortedEvents.forEach((evt) => {
    const startDate = parseISO(evt.start_at);
    let key = format(startDate, 'yyyy-MM-dd');
    if (isToday(startDate)) key = 'HÔM NAY · ' + format(startDate, 'EEEE, dd/MM/yyyy', { locale: vi });
    else if (isTomorrow(startDate)) key = 'NGÀY MAI · ' + format(startDate, 'EEEE, dd/MM/yyyy', { locale: vi });
    else key = format(startDate, 'EEEE, dd/MM/yyyy', { locale: vi }).toUpperCase();

    if (!groupedEvents[key]) groupedEvents[key] = [];
    groupedEvents[key].push(evt);
  });

  return (
    <div className="h-full w-full p-3 sm:p-4 md:p-6 overflow-y-auto select-none space-y-5 md:space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm md:text-base text-slate-900 leading-tight">
              Danh sách lịch công việc sắp tới
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Hiển thị {events.length} lịch công việc sắp tới
            </p>
          </div>
        </div>

        {/* Sort Filter Button */}
        <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shrink-0">
          <span className="hidden sm:inline">Sắp xếp:</span>
          <span>Thời gian</span>
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Main Events List */}
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-500">Chưa có lịch công việc nào trong danh sách.</p>
        </div>
      ) : (
        <div className="space-y-5 md:space-y-6">
          {Object.entries(groupedEvents).map(([dayLabel, dayEvents]) => (
            <div key={dayLabel} className="space-y-3">
              {/* Day Section Header */}
              <div className="flex items-center gap-2 text-xs md:text-sm font-black text-slate-600 uppercase tracking-wider pl-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="capitalize">{dayLabel}</span>
              </div>

              {/* Event Cards inside Day */}
              <div className="space-y-3">
                {dayEvents.map((evt) => {
                  const startDate = parseISO(evt.start_at);
                  const endDate = parseISO(evt.end_at);

                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 hover:border-blue-200 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 group"
                    >
                      {/* Left: Clean Prominent Time Column */}
                      <div className="w-full sm:w-36 shrink-0 sm:border-r sm:border-slate-100 sm:pr-4">
                        <div className="text-blue-600 font-black text-base md:text-lg flex items-center gap-1">
                          <span>{format(startDate, 'HH:mm')}</span>
                          <span className="text-slate-400 font-bold text-xs md:text-sm">– {format(endDate, 'HH:mm')}</span>
                        </div>
                      </div>

                      {/* Middle: Title, Location, Tags */}
                      <div className="flex-1 space-y-2">
                        <h3 className="font-bold text-sm md:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                          {evt.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-semibold">
                          {evt.location && (
                            <span className="flex items-center gap-1">
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

                        {/* Tag Badge */}
                        <div className="pt-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
