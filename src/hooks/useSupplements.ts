import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Supplement, SupplementCategory } from '@/types/supplement';

export function useSupplements(filters?: {
  category?: SupplementCategory;
  search?: string;
}) {
  return useQuery({
    queryKey: ['supplements', filters],
    queryFn: async () => {
      let query = supabase
        .from('supplements')
        .select('*')
        .order('name');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Supplement[];
    },
  });
}

export function useSupplement(id: string | undefined) {
  return useQuery({
    queryKey: ['supplement', id],
    queryFn: async () => {
      if (!id) throw new Error('No supplement ID provided');
      
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Supplement;
    },
    enabled: !!id,
  });
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
      return data;
    },
    enabled: !!supplementId,
  });
}
