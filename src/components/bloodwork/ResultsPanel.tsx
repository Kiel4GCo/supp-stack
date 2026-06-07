import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useDeleteReport } from '@/hooks/useBloodWork';
import type { ResultStatus } from '@/types/bloodwork';

interface Row {
  id: string;
  marker_name: string;
  value: number;
  unit: string;
  range_low: number | null;
  range_high: number | null;
  status: ResultStatus;
  test_date: string;
  report_id: string;
  lab_name: string | null;
}

const statusVariant = (s: ResultStatus) =>
  s === 'normal' ? 'secondary' : s === 'low' ? 'default' : 'destructive';

export function ResultsPanel({ rows }: { rows: Row[] }) {
  const del = useDeleteReport();

  // Group by report
  const byReport = new Map<string, Row[]>();
  rows.forEach((r) => {
    const arr = byReport.get(r.report_id) ?? [];
    arr.push(r);
    byReport.set(r.report_id, arr);
  });

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No results yet. Add your first via Manual entry or Upload.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from(byReport.entries()).map(([reportId, items]) => {
        const head = items[0];
        return (
          <Card key={reportId}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {new Date(head.test_date).toLocaleDateString()}
                  {head.lab_name ? ` · ${head.lab_name}` : ''}
                </CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(reportId)} title="Delete report">
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <div>
                    <div className="font-medium">{r.marker_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Ref: {r.range_low ?? '—'} – {r.range_high ?? '—'} {r.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">{r.value} {r.unit}</div>
                    </div>
                    <Badge variant={statusVariant(r.status) as any} className="uppercase">{r.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}