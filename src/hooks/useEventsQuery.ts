import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { eventsService } from '../lib/events-service';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import type { EventFormData } from '../types/database';

export function useEventsQuery(includeDeleted = false) {
  const queryClient = useQueryClient();

  // Events Query
  const eventsQuery = useQuery({
    queryKey: ['events', includeDeleted],
    queryFn: () => eventsService.getEvents(includeDeleted),
    staleTime: 1000 * 30,
  });

  // Activity Logs Query
  const logsQuery = useQuery({
    queryKey: ['activity_logs'],
    queryFn: () => eventsService.getActivityLogs(),
    enabled: includeDeleted,
  });

  // Setup Realtime & Local Storage listener
  useEffect(() => {
    const handleLocalUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
    };
    window.addEventListener('local_calendar_update', handleLocalUpdate);

    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('public:events')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
          queryClient.invalidateQueries({ queryKey: ['events'] });
          queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('local_calendar_update', handleLocalUpdate);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData: EventFormData) => eventsService.createEvent(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: Partial<EventFormData> }) =>
      eventsService.updateEvent(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => eventsService.restoreEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoadingEvents: eventsQuery.isLoading,
    logs: logsQuery.data || [],
    isLoadingLogs: logsQuery.isLoading,
    createEvent: createMutation.mutateAsync,
    updateEvent: updateMutation.mutateAsync,
    deleteEvent: deleteMutation.mutateAsync,
    restoreEvent: restoreMutation.mutateAsync,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || restoreMutation.isPending,
  };
}
