import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useBloodWorkResults, useBloodWorkReports } from '@/hooks/useBloodWork';
import { ManualResultForm } from '@/components/bloodwork/ManualResultForm';
import { BloodWorkUpload } from '@/components/bloodwork/BloodWorkUpload';
import { ResultsPanel } from '@/components/bloodwork/ResultsPanel';
import { RecommendationsCard } from '@/components/bloodwork/RecommendationsCard';
import { MarkerTrendChart } from '@/components/bloodwork/MarkerTrendChart';

const BloodWork = () => {
  const { user, loading } = useAuth();
  const { data: results, isLoading: resultsLoading } = useBloodWorkResults(user?.id);
  const { data: reports } = useBloodWorkReports(user?.id);

  const rows = useMemo(() => (results ?? []).map((r) => ({
    id: r.id,
    report_id: r.report_id,
    marker_id: r.marker_id,
    marker_name: r.blood_markers?.name ?? 'Marker',
    value: Number(r.value),
    unit: r.unit,
    range_low: r.range_low != null ? Number(r.range_low) : null,
    range_high: r.range_high != null ? Number(r.range_high) : null,
    status: r.status,
    test_date: r.blood_work_reports?.test_date ?? '',
    lab_name: r.blood_work_reports?.lab_name ?? null,
  })), [results]);

  const latestReport = reports?.[0];
  const latestRows = useMemo(
    () => rows.filter((r) => r.report_id === latestReport?.id),
    [rows, latestReport?.id],
  );
  const abnormal = useMemo(
    () => latestRows.filter((r) => r.status !== 'normal').map((r) => ({
      marker_id: r.marker_id,
      marker_name: r.marker_name,
      status: r.status as 'low' | 'high',
      value: r.value,
      unit: r.unit,
    })),
    [latestRows],
  );

  if (loading) {
    return <Layout><Skeleton className="h-64 w-full" /></Layout>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Blood Work</h1>
          <p className="text-muted-foreground">
            Track lab results and get supplement recommendations for out-of-range markers.
          </p>
        </div>

        <Tabs defaultValue="latest">
          <TabsList>
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="manual">Manual entry</TabsTrigger>
            <TabsTrigger value="upload">Upload report</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="space-y-4">
            {resultsLoading ? <Skeleton className="h-48" /> : (
              <>
                <RecommendationsCard abnormal={abnormal} />
                <ResultsPanel rows={latestRows} />
              </>
            )}
          </TabsContent>

          <TabsContent value="manual">
            <Card><CardContent className="pt-6"><ManualResultForm userId={user.id} /></CardContent></Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card><CardContent className="pt-6"><BloodWorkUpload userId={user.id} /></CardContent></Card>
          </TabsContent>

          <TabsContent value="trends">
            <MarkerTrendChart rows={rows} />
          </TabsContent>

          <TabsContent value="history">
            <ResultsPanel rows={rows} />
          </TabsContent>
        </Tabs>

        <Card className="bg-muted/30 border-muted">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Important:</strong> This tool is for educational purposes only and does not
              constitute medical advice. Always consult a qualified healthcare provider regarding lab results.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BloodWork;