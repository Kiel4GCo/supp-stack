import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Deficiency, Supplement } from '@/types/supplement';

export interface DeficiencyWithSupplements extends Deficiency {
  recommended_supplements: {
    supplement: Supplement;
    priority: number;
    notes: string | null;
  }[];
}

export function useDeficiencies() {
  return useQuery({
    queryKey: ['deficiencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deficiencies')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Deficiency[];
    },
  });
}

export function useDeficiency(id: string | undefined) {
  return useQuery({
    queryKey: ['deficiency', id],
    queryFn: async () => {
      if (!id) throw new Error('No deficiency ID provided');

      const { data, error } = await supabase
        .from('deficiencies')
        .select(`
          *,
          deficiency_supplements(
            priority,
            notes,
            supplement:supplements(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const deficiency = data as unknown as DeficiencyWithSupplements & {
        deficiency_supplements: Array<{
          priority: number;
          notes: string | null;
          supplement: Supplement;
        }>;
      };

      return {
        ...deficiency,
        recommended_supplements: deficiency.deficiency_supplements
          .sort((a, b) => a.priority - b.priority)
          .map(ds => ({
            supplement: ds.supplement,
            priority: ds.priority,
            notes: ds.notes,
          })),
      } as DeficiencyWithSupplements;
    },
    enabled: !!id,
  });
}

export function useDeficienciesBySymptoms(symptoms: string[]) {
  return useQuery({
    queryKey: ['deficiencies-by-symptoms', symptoms],
    queryFn: async () => {
      if (symptoms.length === 0) return [];

      // Fetch all deficiencies with their supplements
      const { data, error } = await supabase
        .from('deficiencies')
        .select(`
          *,
          deficiency_supplements(
            priority,
            notes,
            supplement:supplements(*)
          )
        `);

      if (error) throw error;

      // Score deficiencies by matching symptoms
      const scoredDeficiencies = data.map(def => {
        const matchedSymptoms = def.symptoms.filter(s =>
          symptoms.some(selected => 
            s.toLowerCase().includes(selected.toLowerCase()) ||
            selected.toLowerCase().includes(s.toLowerCase())
          )
        );
        return {
          ...def,
          matchCount: matchedSymptoms.length,
          matchedSymptoms,
          recommended_supplements: (def as any).deficiency_supplements
            ?.sort((a: any, b: any) => a.priority - b.priority)
            .map((ds: any) => ({
              supplement: ds.supplement,
              priority: ds.priority,
              notes: ds.notes,
            })) || [],
        };
      });

      // Return only deficiencies with at least one match, sorted by match count
      return scoredDeficiencies
        .filter(d => d.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount) as (DeficiencyWithSupplements & {
          matchCount: number;
          matchedSymptoms: string[];
        })[];
    },
    enabled: symptoms.length > 0,
  });
}

export function useAllSymptoms() {
  return useQuery({
    queryKey: ['all-symptoms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deficiencies')
        .select('symptoms');

      if (error) throw error;

      // Flatten and dedupe all symptoms
      const allSymptoms = new Set<string>();
      data.forEach(d => {
        d.symptoms.forEach(s => allSymptoms.add(s));
      });

      return Array.from(allSymptoms).sort();
    },
  });
}
