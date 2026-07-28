import React, { useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import type { CalendarEvent, CalendarViewMode } from '../../types/database';
import { format } from 'date-fns';

interface CalendarViewProps {
  events: CalendarEvent[];
  viewMode: CalendarViewMode;
  onSelectEvent: (event: CalendarEvent) => void;
  onDateClick: (dateIso: string) => void;
  onSelectSlot: (startIso: string, endIso: string) => void;
  onEventDropOrResize: (id: string, newStartIso: string, newEndIso: string) => void;
  calendarRef: React.RefObject<any>;
}

// Short 2-letter day names in Vietnamese
const VI_SHORT_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Pastel palette variants matching reference screenshots 2 & 3
const PASTEL_COLORS = [
  { bg: '#eff6ff', border: '#2563eb', text: '#1e40af', badgeBg: '#dbeafe', badgeText: '#1e40af' }, // Soft Blue
  { bg: '#f0fdf4', border: '#16a34a', text: '#166534', badgeBg: '#dcfce7', badgeText: '#15803d' }, // Soft Green
  { bg: '#fefce8', border: '#d97706', text: '#92400e', badgeBg: '#fef3c7', badgeText: '#b45309' }, // Soft Yellow/Orange
  { bg: '#faf5ff', border: '#9333ea', text: '#6b21a8', badgeBg: '#f3e8ff', badgeText: '#7e22ce' }, // Soft Purple
  { bg: '#fdf2f8', border: '#db2777', text: '#9d174d', badgeBg: '#fce7f3', badgeText: '#be185d' }, // Soft Pink
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  viewMode,
  onSelectEvent,
  onDateClick,
  onSelectSlot,
  onEventDropOrResize,
  calendarRef,
}) => {
  const currentFcView = viewMode === 'dayGridMonth' ? 'dayGridMonth' : 'timeGridWeek';

  useEffect(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (api.view.type !== currentFcView) {
        api.changeView(currentFcView);
      }
    }
  }, [currentFcView, calendarRef]);

  // Convert events to FullCalendar event format with assigned pastel palette
  const fcEvents = events.map((e, idx) => {
    const palette = PASTEL_COLORS[idx % PASTEL_COLORS.length];
    return {
      id: e.id,
      title: e.title,
      start: e.start_at,
      end: e.end_at,
      allDay: false, // Force false so all events render cleanly in the time grid
      backgroundColor: palette.bg,
      borderColor: palette.border,
      textColor: palette.text,
      extendedProps: { ...e, palette },
    };
  });

  return (
    <div className="h-full w-full p-2 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-x-auto select-none">
      <div className={`h-full w-full ${currentFcView === 'timeGridWeek' ? 'min-w-[600px] md:min-w-0' : 'w-full'}`}>
        <FullCalendar
          key={currentFcView}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={currentFcView}
          headerToolbar={false}
          allDaySlot={false} // Disable "Cả ngày" row
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={2}
          weekends={true}
          nowIndicator={true}
          locale="vi"
          firstDay={1}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          scrollTime="08:00:00"
          height="100%"
          events={fcEvents}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          dayHeaderContent={(args) => {
            const date = args.date;
            const dayName = VI_SHORT_DAYS[date.getDay()];
            const dayNum = format(date, 'dd/MM');

            if (currentFcView === 'dayGridMonth') {
              return (
                <div className="py-1 text-center font-black text-xs text-slate-600">
                  {dayName}
                </div>
              );
            }

            return (
              <div className="flex flex-col items-center justify-center py-1 gap-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  {dayName}
                </span>
                {args.isToday ? (
                  <span className="px-2 py-0.5 bg-blue-600 text-white font-black text-xs rounded-full shadow-xs">
                    {dayNum}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-800">
                    {dayNum}
                  </span>
                )}
              </div>
            );
          }}
          eventClick={(info) => {
            onSelectEvent(info.event.extendedProps as CalendarEvent);
          }}
          dateClick={(info) => {
            onDateClick(info.dateStr);
          }}
          select={(info) => {
            onSelectSlot(info.startStr, info.endStr);
          }}
          eventDrop={(info) => {
            onEventDropOrResize(
              info.event.id,
              info.event.start?.toISOString() || '',
              info.event.end?.toISOString() || info.event.start?.toISOString() || ''
            );
          }}
          eventResize={(info) => {
            onEventDropOrResize(
              info.event.id,
              info.event.start?.toISOString() || '',
              info.event.end?.toISOString() || info.event.start?.toISOString() || ''
            );
          }}
          eventContent={(eventInfo) => {
            const rawEvent = eventInfo.event.extendedProps as CalendarEvent & { palette: typeof PASTEL_COLORS[0] };
            const palette = rawEvent.palette || PASTEL_COLORS[0];
            const startTimeStr = eventInfo.event.start ? format(eventInfo.event.start, 'HH:mm') : '';
            const endTimeStr = eventInfo.event.end ? format(eventInfo.event.end, 'HH:mm') : '';

            // Month view simplified card
            if (currentFcView === 'dayGridMonth') {
              return (
                <div 
                  className="flex items-center gap-1 w-full px-1.5 py-0.5 rounded text-[10px] font-bold truncate"
                  style={{
                    backgroundColor: palette.bg,
                    color: palette.text,
                    borderLeft: `3px solid ${palette.border}`,
                  }}
                >
                  <span className="truncate">{eventInfo.event.title}</span>
                </div>
              );
            }

            // Week view detailed card
            return (
              <div 
                className="flex flex-col h-full w-full leading-tight p-1.5 overflow-hidden rounded-xl border-l-4 shadow-2xs group"
                style={{
                  backgroundColor: palette.bg,
                  borderLeftColor: palette.border,
                  color: palette.text,
                }}
              >
                {/* Event Time */}
                {startTimeStr && (
                  <span className="text-[10px] font-bold opacity-85 mb-0.5">
                    {startTimeStr} {endTimeStr ? `– ${endTimeStr}` : ''}
                  </span>
                )}

                {/* Event Title */}
                <span className="font-extrabold truncate text-xs leading-snug">
                  {eventInfo.event.title}
                </span>

                {/* Location */}
                {rawEvent.location && (
                  <span className="text-[10px] opacity-85 truncate mt-0.5 flex items-center gap-0.5">
                    📍 {rawEvent.location}
                  </span>
                )}

                {/* Tag Badge if available */}
                {rawEvent.tag && (
                  <div className="mt-auto pt-0.5">
                    <span 
                      className="px-1 py-0.5 rounded text-[9px] font-bold"
                      style={{ backgroundColor: palette.badgeBg, color: palette.badgeText }}
                    >
                      {rawEvent.tag}
                    </span>
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};
