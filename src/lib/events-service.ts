import { supabase, isSupabaseConfigured } from '../config/supabase';
import type { CalendarEvent, ActivityLog, EventFormData } from '../types/database';
import { LOCAL_STORAGE_KEYS, SAMPLE_INITIAL_EVENTS } from '../config/constants';

// Helper to get local data
const getLocalEvents = (): CalendarEvent[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.OFFLINE_EVENTS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.OFFLINE_EVENTS, JSON.stringify(SAMPLE_INITIAL_EVENTS));
    return SAMPLE_INITIAL_EVENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return SAMPLE_INITIAL_EVENTS;
  }
};

const saveLocalEvents = (events: CalendarEvent[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.OFFLINE_EVENTS, JSON.stringify(events));
  // Broadcast custom event for local tab realtime simulation
  window.dispatchEvent(new CustomEvent('local_calendar_update'));
};

const getLocalLogs = (): ActivityLog[] => {
  const data = localStorage.getItem('liberal_calendar_logs');
  return data ? JSON.parse(data) : [];
};

const saveLocalLog = (log: Omit<ActivityLog, 'id' | 'created_at'>) => {
  const logs = getLocalLogs();
  const newLog: ActivityLog = {
    ...log,
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    created_at: new Date().toISOString(),
  };
  logs.unshift(newLog);
  localStorage.setItem('liberal_calendar_logs', JSON.stringify(logs.slice(0, 100)));
};

export const eventsService = {
  // Fetch events (active or include deleted for owner)
  async getEvents(includeDeleted = false): Promise<CalendarEvent[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('events').select('*');
        if (!includeDeleted) {
          query = query.is('deleted_at', null);
        }
        const { data, error } = await query;
        if (!error && data) {
          // Merge local tag or default tag
          const local = getLocalEvents();
          const localTagMap = new Map(local.map(l => [l.id, l.tag]));

          return data.map(e => ({
            ...e,
            tag: localTagMap.get(e.id) || e.tag || 'Họp hành',
          })) as CalendarEvent[];
        }
      } catch (err) {
        console.warn('Supabase fetch error, using local fallback:', err);
      }
    }
    
    // Fallback Local
    const local = getLocalEvents();
    return local.filter(e => includeDeleted ? true : !e.deleted_at);
  },

  // Create Event
  async createEvent(formData: EventFormData): Promise<CalendarEvent> {
    const startIso = new Date(`${formData.start_date}T${formData.all_day ? '00:00' : formData.start_time}`).toISOString();
    const endIso = new Date(`${formData.end_date}T${formData.all_day ? '23:59' : formData.end_time}`).toISOString();

    const dbPayload = {
      title: formData.title,
      description: formData.description || '',
      start_at: startIso,
      end_at: endIso,
      all_day: Boolean(formData.all_day),
      location: formData.location || '',
      meeting_url: formData.meeting_url || '',
      status: 'scheduled' as const,
      timezone: 'Asia/Ho_Chi_Minh',
    };

    let createdEvent: CalendarEvent | null = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .insert([dbPayload])
          .select('*')
          .single();

        if (!error && data) {
          createdEvent = {
            ...data,
            tag: formData.tag || 'Họp hành',
          } as CalendarEvent;
        } else if (error) {
          console.warn('Supabase insert warning:', error);
        }
      } catch (err) {
        console.warn('Supabase insert exception:', err);
      }
    }

    // Local Fallback / Sync
    const local = getLocalEvents();
    if (!createdEvent) {
      createdEvent = {
        ...dbPayload,
        tag: formData.tag || 'Họp hành',
        id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    local.push(createdEvent);
    saveLocalEvents(local);
    saveLocalLog({
      event_id: createdEvent.id,
      action: 'create',
      new_data: createdEvent,
      event_title: createdEvent.title,
    });

    return createdEvent;
  },

  // Update Event
  async updateEvent(id: string, formData: Partial<EventFormData>): Promise<CalendarEvent> {
    const existingEvents = await this.getEvents(true);
    const oldEvent = existingEvents.find(e => e.id === id);

    let startIso = oldEvent?.start_at;
    let endIso = oldEvent?.end_at;

    if (formData.start_date && formData.start_time) {
      startIso = new Date(`${formData.start_date}T${formData.all_day ? '00:00' : formData.start_time}`).toISOString();
    }
    if (formData.end_date && formData.end_time) {
      endIso = new Date(`${formData.end_date}T${formData.all_day ? '23:59' : formData.end_time}`).toISOString();
    }

    const dbUpdates: Record<string, any> = {
      ...(formData.title && { title: formData.title }),
      ...(formData.description !== undefined && { description: formData.description }),
      ...(startIso && { start_at: startIso }),
      ...(endIso && { end_at: endIso }),
      ...(formData.all_day !== undefined && { all_day: formData.all_day }),
      ...(formData.location !== undefined && { location: formData.location }),
      ...(formData.meeting_url !== undefined && { meeting_url: formData.meeting_url }),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .update(dbUpdates)
          .eq('id', id)
          .select('*')
          .single();

        if (error) {
          console.warn('Supabase update warning:', error);
        }
      } catch (err) {
        console.warn('Supabase update exception:', err);
      }
    }

    // Local Fallback & Sync
    const local = getLocalEvents();
    const idx = local.findIndex(e => e.id === id);
    if (idx !== -1) {
      local[idx] = {
        ...local[idx],
        ...dbUpdates,
        ...(formData.tag !== undefined && { tag: formData.tag }),
      };
      saveLocalEvents(local);
      saveLocalLog({
        event_id: id,
        action: 'update',
        old_data: oldEvent,
        new_data: local[idx],
        event_title: local[idx].title,
      });
      return local[idx];
    }
    throw new Error('Event not found');
  },

  // Soft Delete Event
  async deleteEvent(id: string): Promise<boolean> {
    const existingEvents = await this.getEvents(true);
    const oldEvent = existingEvents.find(e => e.id === id);

    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('events')
          .update({ deleted_at: now })
          .eq('id', id);
        if (error) {
          console.warn('Supabase delete warning:', error);
        }
      } catch (err) {
        console.warn('Supabase delete exception:', err);
      }
    }

    // Local Fallback & Sync
    const local = getLocalEvents();
    const idx = local.findIndex(e => e.id === id);
    if (idx !== -1) {
      local[idx].deleted_at = now;
      saveLocalEvents(local);
      saveLocalLog({
        event_id: id,
        action: 'delete',
        old_data: oldEvent,
        event_title: oldEvent?.title,
      });
      return true;
    }
    return false;
  },

  // Restore Event (Manager/Owner only)
  async restoreEvent(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('events')
          .update({ deleted_at: null })
          .eq('id', id);
        if (error) {
          console.warn('Supabase restore warning:', error);
        }
      } catch (err) {
        console.warn('Supabase restore exception:', err);
      }
    }

    // Local Fallback & Sync
    const local = getLocalEvents();
    const idx = local.findIndex(e => e.id === id);
    if (idx !== -1) {
      const oldEvent = { ...local[idx] };
      local[idx].deleted_at = null;
      saveLocalEvents(local);
      saveLocalLog({
        event_id: id,
        action: 'restore',
        old_data: oldEvent,
        new_data: local[idx],
        event_title: local[idx].title,
      });
      return true;
    }
    return false;
  },

  // Get Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data as ActivityLog[];
      } catch (err) {
        console.warn('Supabase logs fetch error:', err);
      }
    }
    return getLocalLogs();
  },
};
