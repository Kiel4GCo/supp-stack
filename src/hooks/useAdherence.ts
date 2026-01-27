import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdherenceLog {
  id: string;
  user_id: string;
  stack_item_id: string | null;
  supplement_id: string;
  logged_date: string;
  taken: boolean;
  notes: string | null;
  created_at: string;
}

export function useAdherenceLogs(userId: string | undefined, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['adherence-logs', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('adherence_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_date', startDate)
        .lte('logged_date', endDate)
        .order('logged_date', { ascending: true });

      if (error) throw error;
      return data as AdherenceLog[];
    },
    enabled: !!userId,
  });
}

export function useLogAdherence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      supplementId,
      loggedDate,
      taken,
      stackItemId,
      notes,
    }: {
      userId: string;
      supplementId: string;
      loggedDate: string;
      taken: boolean;
      stackItemId?: string;
      notes?: string;
    }) => {
      // Use upsert to handle duplicate dates
      const { data, error } = await supabase
        .from('adherence_logs')
        .upsert(
          {
            user_id: userId,
            supplement_id: supplementId,
            logged_date: loggedDate,
            taken,
            stack_item_id: stackItemId || null,
            notes: notes || null,
          },
          {
            onConflict: 'user_id,supplement_id,logged_date',
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adherence-logs'] });
    },
  });
}

export function useDeleteAdherenceLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('adherence_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adherence-logs'] });
    },
  });
}
