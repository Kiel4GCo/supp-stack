import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Supplement, SupplementInteraction } from '@/types/supplement';

export interface InteractionWithSupplement extends SupplementInteraction {
  related_supplement: Supplement;
}

export function useSupplementInteractions(supplementId: string | undefined) {
  return useQuery({
    queryKey: ['supplement-interactions', supplementId],
    queryFn: async () => {
      if (!supplementId) throw new Error('No supplement ID provided');

      const { data, error } = await supabase
        .from('supplement_interactions')
        .select(`
          *,
          related_supplement:supplements!supplement_interactions_related_supplement_id_fkey(*)
        `)
        .eq('supplement_id', supplementId);

      if (error) throw error;
      return data as InteractionWithSupplement[];
    },
    enabled: !!supplementId,
  });
}

export function useStackInteractions(supplementIds: string[]) {
  return useQuery({
    queryKey: ['stack-interactions', supplementIds],
    queryFn: async () => {
      if (supplementIds.length < 2) return { conflicts: [], synergies: [] };

      // Get all interactions between supplements in the stack
      const { data, error } = await supabase
        .from('supplement_interactions')
        .select(`
          *,
          supplement:supplements!supplement_interactions_supplement_id_fkey(*),
          related_supplement:supplements!supplement_interactions_related_supplement_id_fkey(*)
        `)
        .in('supplement_id', supplementIds)
        .in('related_supplement_id', supplementIds);

      if (error) throw error;

      const interactions = data as (SupplementInteraction & {
        supplement: Supplement;
        related_supplement: Supplement;
      })[];

      return {
        conflicts: interactions.filter(i => i.interaction_type === 'conflict'),
        synergies: interactions.filter(i => i.interaction_type === 'synergy'),
      };
    },
    enabled: supplementIds.length >= 2,
  });
}
