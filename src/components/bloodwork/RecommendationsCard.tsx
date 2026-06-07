import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pill, Plus, Check, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStack } from '@/hooks/useStack';
import { useMarkerRecommendations } from '@/hooks/useBloodWork';

interface AbnormalResult {
  marker_id: string;
  marker_name: string;
  status: 'low' | 'high';
  value: number;
  unit: string;
}

export function RecommendationsCard({ abnormal }: { abnormal: AbnormalResult[] }) {
  const markerIds = Array.from(new Set(abnormal.map((a) => a.marker_id)));
  const { data: recs } = useMarkerRecommendations(markerIds);
  const { stack, addToStack, removeFromStack } = useStack();

  if (abnormal.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Check className="h-5 w-5 text-chart-1" />All results in range</CardTitle>
          <CardDescription>No supplement recommendations triggered by your latest panel.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const inStack = (id: string) => stack.some((s) => s.supplement.id === id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Recommendations</CardTitle>
        <CardDescription>Based on your out-of-range markers. Not medical advice.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {abnormal.map((a) => {
          const matched = (recs ?? []).filter((r) => r.marker_id === a.marker_id && r.direction === a.status);
          return (
            <div key={`${a.marker_id}-${a.status}`} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={a.status === 'low' ? 'default' : 'destructive'} className="uppercase">{a.status}</Badge>
                <span className="font-medium">{a.marker_name}</span>
                <span className="text-sm text-muted-foreground">{a.value} {a.unit}</span>
              </div>
              {matched.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-2">No catalog recommendations yet. Consult your healthcare provider.</p>
              ) : (
                <div className="space-y-2 pl-2">
                  {matched.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-primary" />
                        <Link to={`/supplement/${m.supplements.id}`} className="font-medium hover:text-primary">
                          {m.supplements.name}
                        </Link>
                        {m.notes && <span className="text-xs text-muted-foreground">— {m.notes}</span>}
                      </div>
                      <Button
                        size="sm"
                        variant={inStack(m.supplements.id) ? 'default' : 'outline'}
                        onClick={() => inStack(m.supplements.id) ? removeFromStack(m.supplements.id) : addToStack(m.supplements)}
                      >
                        {inStack(m.supplements.id) ? (<><Check className="h-3.5 w-3.5 mr-1" />Added</>) : (<><Plus className="h-3.5 w-3.5 mr-1" />Add</>)}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}