export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ActivityAction = 'create' | 'update' | 'delete' | 'restore';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_at: string; // ISO string
  end_at: string;   // ISO string
  all_day: boolean;
  location?: string;
  meeting_url?: string;
  status: EventStatus;
  tag?: string; // e.g. 'Họp hành', 'Deadline', 'Sự kiện'
  timezone: string;
  
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ActivityLog {
  id: string;
  event_id: string;
  user_id?: string;
  action: ActivityAction;
  old_data?: Partial<CalendarEvent>;
  new_data?: Partial<CalendarEvent>;
  changed_fields?: Record<string, { old: any; new: any }>;
  created_at: string;
  event_title?: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  meeting_url?: string;
  tag?: string;
}

export interface EventFilterState {
  searchQuery: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export type CalendarViewMode = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth' | 'listUpcoming';
