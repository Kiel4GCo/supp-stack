import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAdherenceAnalytics, type DateRange } from '@/hooks/useAdherenceAnalytics';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Flame, Target, Award, ArrowRight, LogIn } from 'lucide-react';
import type { StackItem } from '@/types/supplement';

interface AdherenceDashboardProps {
  stack: StackItem[];
}

export function AdherenceDashboard({ stack }: AdherenceDashboardProps) {
  const { user } = useAuth();
  const [range, setRange] = useState<DateRange>('30d');

  const supplementNames = Object.fromEntries(
    stack.map(s => [s.supplement.id, s.supplement.name])
  );

  const { weeklyData, monthlyTrend, supplementBreakdown, streaks, summary, isLoading } = useAdherenceAnalytics(
    user?.id,
    range,
    supplementNames
  );

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <LogIn className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sign in to view analytics</h3>
          <p className="text-muted-foreground mb-4">Track your adherence over time with detailed charts.</p>
          <Button asChild>
            <Link to="/auth">
              Sign In <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const ranges: { value: DateRange; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex gap-2">
        {ranges.map(r => (
          <Button
            key={r.value}
            size="sm"
            variant={range === r.value ? 'default' : 'outline'}
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs font-medium">Adherence Rate</span>
            </div>
            <p className="text-2xl font-bold">{summary.overallRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Total Doses</span>
            </div>
            <p className="text-2xl font-bold">{summary.totalDoses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-medium">Current Streak</span>
            </div>
            <p className="text-2xl font-bold">{streaks.current} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Award className="h-4 w-4" />
              <span className="text-xs font-medium">Longest Streak</span>
            </div>
            <p className="text-2xl font-bold">{streaks.longest} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly bar chart */}
      {weeklyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Adherence</CardTitle>
            <CardDescription>Average adherence by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} className="text-xs" />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Rate']} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell key={i} className={entry.rate >= 80 ? 'fill-chart-1' : entry.rate >= 50 ? 'fill-chart-2' : 'fill-chart-5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Monthly trend */}
      {monthlyTrend.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adherence Trend</CardTitle>
            <CardDescription>Weekly adherence rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" className="text-xs" />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} className="text-xs" />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Rate']} />
                <Line type="monotone" dataKey="rate" className="stroke-primary" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Per-supplement breakdown */}
      {supplementBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Per-Supplement Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(150, supplementBreakdown.length * 40)}>
              <BarChart data={supplementBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} className="text-xs" />
                <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Rate']} />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Most/least consistent */}
      {(summary.mostConsistent || summary.leastConsistent) && (
        <div className="flex flex-wrap gap-4">
          {summary.mostConsistent && (
            <Badge variant="secondary" className="text-sm py-1 px-3">
              🏆 Most consistent: {summary.mostConsistent}
            </Badge>
          )}
          {summary.leastConsistent && summary.leastConsistent !== summary.mostConsistent && (
            <Badge variant="outline" className="text-sm py-1 px-3">
              ⚠️ Needs attention: {summary.leastConsistent}
            </Badge>
          )}
        </div>
      )}

      {!isLoading && weeklyData.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No adherence data yet. Start tracking in the Monthly calendar tab!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
