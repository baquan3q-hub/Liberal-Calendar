import { useState, useRef, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { CalendarView } from './components/calendar/CalendarView';
import { DayView } from './components/calendar/DayView';
import { UpcomingList } from './components/calendar/UpcomingList';
import { EventFormModal } from './components/events/EventFormModal';
import { EventDetailModal } from './components/events/EventDetailModal';
import { OwnerLoginModal } from './components/ui/OwnerLoginModal';
import { DeletedEventsModal } from './components/events/DeletedEventsModal';
import { ActivityLogModal } from './components/events/ActivityLogModal';
import { useEventsQuery } from './hooks/useEventsQuery';
import { useOwnerAuth } from './hooks/useOwnerAuth';
import type { CalendarEvent, CalendarViewMode, EventFormData } from './types/database';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function CalendarApp() {
  const calendarRef = useRef<any>(null);

  // States: Default view on mobile is 'listUpcoming' (Trang chủ lịch trình gần nhất -> xa nhất)
  const [viewMode, setViewMode] = useState<CalendarViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'listUpcoming';
    }
    return 'timeGridWeek';
  });

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentDateText, setCurrentDateText] = useState<string>(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return `Tuần (${format(start, 'dd/MM')} – ${format(end, 'dd/MM/yyyy')})`;
  });

  // Modals & Panels
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Slot Selection prefill
  const [defaultSlotStart, setDefaultSlotStart] = useState<string | undefined>();
  const [defaultSlotEnd, setDefaultSlotEnd] = useState<string | undefined>();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Hooks
  const { isOwner, isLoginModalOpen, setIsLoginModalOpen, loginAsOwner } = useOwnerAuth();
  const { 
    events, 
    logs, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    restoreEvent 
  } = useEventsQuery(isOwner);

  // Counts for Sidebar badges
  const scheduledCount = useMemo(() => events.filter(e => e.status === 'scheduled').length, [events]);
  const inProgressCount = useMemo(() => events.filter(e => e.status === 'in_progress').length, [events]);
  const completedCount = useMemo(() => events.filter(e => e.status === 'completed').length, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchDesc = e.description?.toLowerCase().includes(q);
        const matchLoc = e.location?.toLowerCase().includes(q);
        const matchTag = e.tag?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc && !matchTag) return false;
      }
      // 2. Status Filter
      if (statusFilter !== 'all' && e.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [events, searchQuery, statusFilter]);

  const deletedEventsList = useMemo(() => {
    return events.filter((e) => Boolean(e.deleted_at));
  }, [events]);

  // Helper to format date text based on view mode
  const formatDateTextForView = (date: Date, mode: CalendarViewMode) => {
    if (mode === 'dayGridMonth') {
      return format(date, 'Tháng MM, yyyy', { locale: vi });
    } else if (mode === 'timeGridWeek') {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return `Tuần (${format(start, 'dd/MM')} – ${format(end, 'dd/MM/yyyy')})`;
    } else {
      return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
    }
  };

  // Calendar Navigation Handlers
  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    if (calendarRef.current && viewMode !== 'listUpcoming' && viewMode !== 'timeGridDay') {
      calendarRef.current.getApi().today();
      updateCurrentDateText();
    } else {
      setCurrentDateText(formatDateTextForView(now, viewMode));
    }
  };

  const handlePrev = () => {
    if (calendarRef.current && viewMode !== 'listUpcoming' && viewMode !== 'timeGridDay') {
      calendarRef.current.getApi().prev();
      updateCurrentDateText();
    } else {
      const prevDate = new Date(currentDate.getTime() - 86400000);
      setCurrentDate(prevDate);
      setCurrentDateText(formatDateTextForView(prevDate, viewMode));
    }
  };

  const handleNext = () => {
    if (calendarRef.current && viewMode !== 'listUpcoming' && viewMode !== 'timeGridDay') {
      calendarRef.current.getApi().next();
      updateCurrentDateText();
    } else {
      const nextDate = new Date(currentDate.getTime() + 86400000);
      setCurrentDate(nextDate);
      setCurrentDateText(formatDateTextForView(nextDate, viewMode));
    }
  };

  const handleViewModeChange = (mode: CalendarViewMode) => {
    setViewMode(mode);
    setCurrentDateText(formatDateTextForView(currentDate, mode));

    if (calendarRef.current && mode !== 'listUpcoming' && mode !== 'timeGridDay') {
      setTimeout(() => {
        if (calendarRef.current) {
          calendarRef.current.getApi().changeView(mode);
          updateCurrentDateText();
        }
      }, 50);
    }
  };

  const updateCurrentDateText = () => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      const current = api.getDate();
      setCurrentDate(current);
      setCurrentDateText(formatDateTextForView(current, viewMode));
    }
  };

  // Direct Shared Server Form Submit Handler
  const handleFormSubmit = async (formData: EventFormData) => {
    if (editingEvent) {
      await updateEvent({ id: editingEvent.id, formData });
    } else {
      await createEvent(formData);
    }
    setEditingEvent(null);
  };

  // Direct Drag Drop / Resize Handler
  const handleEventDropOrResize = async (id: string, newStartIso: string, newEndIso: string) => {
    const startDateObj = parseISO(newStartIso);
    const endDateObj = parseISO(newEndIso);

    await updateEvent({
      id,
      formData: {
        start_date: format(startDateObj, 'yyyy-MM-dd'),
        start_time: format(startDateObj, 'HH:mm'),
        end_date: format(endDateObj, 'yyyy-MM-dd'),
        end_time: format(endDateObj, 'HH:mm'),
      },
    });
  };

  // Direct Delete Handler
  const handleDeleteEvent = async (event: CalendarEvent) => {
    await deleteEvent(event.id);
  };

  // Direct Restore Handler
  const handleRestoreEvent = async (id: string) => {
    await restoreEvent(id);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f4f6f9] text-slate-800 font-sans">
      {/* 1. Shared Header */}
      <Header
        currentDateText={currentDateText}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onToday={handleToday}
        onPrev={handlePrev}
        onNext={handleNext}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => {
          setEditingEvent(null);
          setDefaultSlotStart(undefined);
          setDefaultSlotEnd(undefined);
          setIsFormOpen(true);
        }}
      />

      {/* 2. Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar (Desktop only) */}
        <Sidebar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onOpenCreateModal={() => {
            setEditingEvent(null);
            setDefaultSlotStart(undefined);
            setDefaultSlotEnd(undefined);
            setIsFormOpen(true);
          }}
          totalEventsCount={filteredEvents.length}
          scheduledCount={scheduledCount}
          inProgressCount={inProgressCount}
          completedCount={completedCount}
        />

        {/* Center Content Workspace */}
        <main className="flex-1 h-full p-2.5 sm:p-4 md:p-6 overflow-hidden relative bg-[#f4f6f9] pb-20 md:pb-6">
          {/* Mobile View Toggle bar for Calendar Shortcut */}
          {viewMode !== 'listUpcoming' && (
            <div className="flex md:hidden items-center justify-between bg-white p-2 mb-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-600 pl-2">Chế độ xem lịch:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleViewModeChange('timeGridWeek')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    viewMode === 'timeGridWeek' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Tuần
                </button>
                <button
                  onClick={() => handleViewModeChange('dayGridMonth')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                    viewMode === 'dayGridMonth' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Tháng
                </button>
              </div>
            </div>
          )}

          {viewMode === 'listUpcoming' ? (
            <UpcomingList
              events={filteredEvents}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onOpenCreateModal={() => {
                setEditingEvent(null);
                setIsFormOpen(true);
              }}
            />
          ) : viewMode === 'timeGridDay' ? (
            <DayView
              events={filteredEvents}
              currentDate={currentDate}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onToday={handleToday}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          ) : (
            <CalendarView
              events={filteredEvents}
              viewMode={viewMode}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onDateClick={(dateIso) => {
                setDefaultSlotStart(dateIso);
                setDefaultSlotEnd(dateIso);
                setEditingEvent(null);
                setIsFormOpen(true);
              }}
              onSelectSlot={(startIso, endIso) => {
                setDefaultSlotStart(startIso);
                setDefaultSlotEnd(endIso);
                setEditingEvent(null);
                setIsFormOpen(true);
              }}
              onEventDropOrResize={handleEventDropOrResize}
              calendarRef={calendarRef}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onOpenCreateModal={() => {
          setEditingEvent(null);
          setIsFormOpen(true);
        }}
      />

      {/* Modals & Dialogs */}
      <EventFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleFormSubmit}
        initialEvent={editingEvent}
        defaultStartDate={defaultSlotStart}
        defaultEndDate={defaultSlotEnd}
      />

      <EventDetailModal
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={(evt) => {
          setEditingEvent(evt);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteEvent}
      />

      <OwnerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={loginAsOwner}
      />

      <DeletedEventsModal
        isOpen={isDeletedModalOpen}
        onClose={() => setIsDeletedModalOpen(false)}
        deletedEvents={deletedEventsList}
        onRestore={handleRestoreEvent}
      />

      <ActivityLogModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={logs}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CalendarApp />
    </QueryClientProvider>
  );
}
