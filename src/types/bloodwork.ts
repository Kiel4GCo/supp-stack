export interface BloodMarker {
  id: string;
  key: string;
  name: string;
  default_unit: string;
  category: string | null;
  description: string | null;
}

export type ResultStatus = 'low' | 'normal' | 'high';

export interface BloodWorkReport {
  id: string;
  user_id: string;
  test_date: string;
  lab_name: string | null;
  source: 'manual' | 'upload';
  original_file_path: string | null;
  notes: string | null;
  created_at: string;
}

export interface BloodWorkResult {
  id: string;
  user_id: string;
  report_id: string;
  marker_id: string;
  value: number;
  unit: string;
  range_low: number | null;
  range_high: number | null;
  status: ResultStatus;
  notes: string | null;
  created_at: string;
}

export interface ExtractedMarker {
  key?: string;
  name: string;
  value: number;
  unit: string;
  range_low?: number;
  range_high?: number;
}

export function computeStatus(
  value: number,
  low: number | null | undefined,
  high: number | null | undefined,
): ResultStatus {
  if (low != null && value < low) return 'low';
  if (high != null && value > high) return 'high';
  return 'normal';
}