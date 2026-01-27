import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Supplement } from '@/types/supplement';

export interface SavedStackItem {
  id: string;
  stack_id: string;
  supplement_id: string;
  days_of_week: string[];
  reminder_time: string | null;
  notes: string | null;
  created_at: string;
  supplement?: Supplement;
}

export interface SavedStack {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  share_token?: string | null;
  is_public?: boolean;
  items?: SavedStackItem[];
}

export interface StackItemInput {
  supplement_id: string;
  days_of_week: string[];
  reminder_time: string | null;
  notes?: string | null;
}

export function useSavedStacks(userId: string | undefined) {
  return useQuery({
    queryKey: ['saved-stacks', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('saved_stacks')
        .select(`
          *,
          items:saved_stack_items(
            *,
            supplement:supplements(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedStack[];
    },
    enabled: !!userId,
  });
}

export function useSaveStack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      name, 
      items 
    }: { 
      userId: string; 
      name: string; 
      items: StackItemInput[];
    }) => {
      // Create the stack
      const { data: stack, error: stackError } = await supabase
        .from('saved_stacks')
        .insert({ user_id: userId, name })
        .select()
        .single();

      if (stackError) throw stackError;

      // Insert stack items
      if (items.length > 0) {
        const stackItems = items.map(item => ({
          stack_id: stack.id,
          supplement_id: item.supplement_id,
          days_of_week: item.days_of_week,
          reminder_time: item.reminder_time,
          notes: item.notes,
        }));

        const { error: itemsError } = await supabase
          .from('saved_stack_items')
          .insert(stackItems);

        if (itemsError) throw itemsError;
      }

      return stack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-stacks'] });
    },
  });
}

export function useDeleteStack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stackId: string) => {
      const { error } = await supabase
        .from('saved_stacks')
        .delete()
        .eq('id', stackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-stacks'] });
    },
  });
}

export function useUpdateStackItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      days_of_week, 
      reminder_time 
    }: { 
      itemId: string; 
      days_of_week?: string[]; 
      reminder_time?: string | null;
    }) => {
      const updates: Record<string, unknown> = {};
      if (days_of_week !== undefined) updates.days_of_week = days_of_week;
      if (reminder_time !== undefined) updates.reminder_time = reminder_time;

      const { error } = await supabase
        .from('saved_stack_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-stacks'] });
    },
  });
}
