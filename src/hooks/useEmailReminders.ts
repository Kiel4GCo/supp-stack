import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmailReminderPreference {
  id: string;
  user_id: string;
  enabled: boolean;
  email: string;
  reminder_time: string;
  days_of_week: string[];
  created_at: string;
  updated_at: string;
}

export function useEmailReminderPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: ['email-reminder-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('email_reminder_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as EmailReminderPreference | null;
    },
    enabled: !!userId,
  });
}

export function useUpsertEmailReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prefs: {
      user_id: string;
      enabled: boolean;
      email: string;
      reminder_time: string;
      days_of_week: string[];
    }) => {
      const { data, error } = await supabase
        .from('email_reminder_preferences')
        .upsert(prefs, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-reminder-preferences'] });
    },
  });
}
