import { useMemo } from 'react';
import { useAdherenceLogs } from './useAdherence';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, parseISO } from 'date-fns';

export type DateRange = '7d' | '30d' | '90d';

export interface WeeklyData {
  day: string;
  rate: number;
  taken: number;
  total: number;
}

export interface MonthlyTrendData {
  label: string;
  rate: number;
}

export interface SupplementBreakdown {
  name: string;
  rate: number;
  taken: number;
  total: number;
}

export interface StreakInfo {
  current: number;
  longest: number;
}

export interface AnalyticsSummary {
  totalDoses: number;
  overallRate: number;
  mostConsistent: string | null;
  leastConsistent: string | null;
}

export function useAdherenceAnalytics(
  userId: string | undefined,
  range: DateRange,
  supplementNames: Record<string, string>
) {
  const now = new Date();
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const startDate = format(subDays(now, days), 'yyyy-MM-dd');
  const endDate = format(now, 'yyyy-MM-dd');

  const { data: logs, isLoading } = useAdherenceLogs(userId, startDate, endDate);

  const weeklyData = useMemo((): WeeklyData[] => {
    if (!logs?.length) return [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const byDay: Record<number, { taken: number; total: number }> = {};
    for (let i = 0; i < 7; i++) byDay[i] = { taken: 0, total: 0 };

    logs.forEach(log => {
      const d = parseISO(log.logged_date).getDay();
      byDay[d].total++;
      if (log.taken) byDay[d].taken++;
    });

    return dayNames.map((name, i) => ({
      day: name,
      rate: byDay[i].total > 0 ? Math.round((byDay[i].taken / byDay[i].total) * 100) : 0,
      taken: byDay[i].taken,
      total: byDay[i].total,
    }));
  }, [logs]);

  const monthlyTrend = useMemo((): MonthlyTrendData[] => {
    if (!logs?.length) return [];
    const weeks: Record<string, { taken: number; total: number }> = {};
    
    logs.forEach(log => {
      const date = parseISO(log.logged_date);
      const weekStart = format(startOfWeek(date), 'MMM d');
      if (!weeks[weekStart]) weeks[weekStart] = { taken: 0, total: 0 };
      weeks[weekStart].total++;
      if (log.taken) weeks[weekStart].taken++;
    });

    return Object.entries(weeks).map(([label, data]) => ({
      label,
      rate: data.total > 0 ? Math.round((data.taken / data.total) * 100) : 0,
    }));
  }, [logs]);

  const supplementBreakdown = useMemo((): SupplementBreakdown[] => {
    if (!logs?.length) return [];
    const bySupp: Record<string, { taken: number; total: number }> = {};

    logs.forEach(log => {
      if (!bySupp[log.supplement_id]) bySupp[log.supplement_id] = { taken: 0, total: 0 };
      bySupp[log.supplement_id].total++;
      if (log.taken) bySupp[log.supplement_id].taken++;
    });

    return Object.entries(bySupp).map(([id, data]) => ({
      name: supplementNames[id] || id.slice(0, 8),
      rate: data.total > 0 ? Math.round((data.taken / data.total) * 100) : 0,
      taken: data.taken,
      total: data.total,
    })).sort((a, b) => b.rate - a.rate);
  }, [logs, supplementNames]);

  const streaks = useMemo((): StreakInfo => {
    if (!logs?.length) return { current: 0, longest: 0 };
    const dateSet = new Set(
      logs.filter(l => l.taken).map(l => l.logged_date)
    );
    const allDays = eachDayOfInterval({ start: subDays(now, days), end: now });
    
    let current = 0;
    let longest = 0;
    let streak = 0;

    allDays.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      if (dateSet.has(key)) {
        streak++;
        longest = Math.max(longest, streak);
      } else {
        streak = 0;
      }
    });
    current = streak;

    return { current, longest };
  }, [logs, days]);

  const summary = useMemo((): AnalyticsSummary => {
    if (!logs?.length) return { totalDoses: 0, overallRate: 0, mostConsistent: null, leastConsistent: null };
    const taken = logs.filter(l => l.taken).length;
    const sorted = [...supplementBreakdown];
    return {
      totalDoses: taken,
      overallRate: Math.round((taken / logs.length) * 100),
      mostConsistent: sorted[0]?.name || null,
      leastConsistent: sorted[sorted.length - 1]?.name || null,
    };
  }, [logs, supplementBreakdown]);

  return { weeklyData, monthlyTrend, supplementBreakdown, streaks, summary, isLoading };
}
