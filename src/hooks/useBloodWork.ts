import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BloodMarker, BloodWorkReport, BloodWorkResult, ExtractedMarker } from '@/types/bloodwork';
import { computeStatus } from '@/types/bloodwork';

export function useBloodMarkers() {
  return useQuery({
    queryKey: ['blood-markers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blood_markers').select('*').order('name');
      if (error) throw error;
      return data as BloodMarker[];
    },
  });
}

export function useBloodWorkReports(userId: string | undefined) {
  return useQuery({
    queryKey: ['bw-reports', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blood_work_reports')
        .select('*')
        .order('test_date', { ascending: false });
      if (error) throw error;
      return data as BloodWorkReport[];
    },
  });
}

export function useBloodWorkResults(userId: string | undefined) {
  return useQuery({
    queryKey: ['bw-results', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blood_work_results')
        .select('*, blood_markers(*), blood_work_reports(test_date, lab_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (BloodWorkResult & {
        blood_markers: BloodMarker;
        blood_work_reports: { test_date: string; lab_name: string | null };
      })[];
    },
  });
}

export function useMarkerRecommendations(markerIds: string[]) {
  return useQuery({
    queryKey: ['marker-recs', markerIds.sort().join(',')],
    enabled: markerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blood_marker_supplements')
        .select('*, supplements(*)')
        .in('marker_id', markerIds)
        .order('priority');
      if (error) throw error;
      return data as Array<{
        id: string;
        marker_id: string;
        direction: 'low' | 'high';
        priority: number;
        notes: string | null;
        supplements: any;
      }>;
    },
  });
}

export interface SaveReportInput {
  userId: string;
  test_date: string;
  lab_name?: string;
  source: 'manual' | 'upload';
  original_file_path?: string | null;
  notes?: string;
  results: Array<{
    marker_id: string;
    value: number;
    unit: string;
    range_low: number | null;
    range_high: number | null;
    notes?: string;
  }>;
}

export function useSaveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveReportInput) => {
      const { data: report, error: reportErr } = await supabase
        .from('blood_work_reports')
        .insert({
          user_id: input.userId,
          test_date: input.test_date,
          lab_name: input.lab_name ?? null,
          source: input.source,
          original_file_path: input.original_file_path ?? null,
          notes: input.notes ?? null,
        })
        .select()
        .single();
      if (reportErr) throw reportErr;

      const rows = input.results.map((r) => ({
        user_id: input.userId,
        report_id: report.id,
        marker_id: r.marker_id,
        value: r.value,
        unit: r.unit,
        range_low: r.range_low,
        range_high: r.range_high,
        status: computeStatus(r.value, r.range_low, r.range_high),
        notes: r.notes ?? null,
      }));

      if (rows.length > 0) {
        const { error: resErr } = await supabase.from('blood_work_results').insert(rows);
        if (resErr) throw resErr;
      }

      return report as BloodWorkReport;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bw-reports'] });
      qc.invalidateQueries({ queryKey: ['bw-results'] });
    },
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blood_work_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bw-reports'] });
      qc.invalidateQueries({ queryKey: ['bw-results'] });
    },
  });
}

export async function extractBloodWork(file_path: string, mime_type: string): Promise<{ test_date?: string; lab_name?: string; markers: ExtractedMarker[] }> {
  const { data, error } = await supabase.functions.invoke('extract-bloodwork', {
    body: { file_path, mime_type },
  });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error || 'Extraction failed');
  return data.extracted;
}