import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, CartesianGrid } from 'recharts';

interface Row {
  marker_id: string;
  marker_name: string;
  value: number;
  unit: string;
  range_low: number | null;
  range_high: number | null;
  test_date: string;
}

export function MarkerTrendChart({ rows }: { rows: Row[] }) {
  const markers = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.marker_id, r.marker_name));
    return Array.from(map.entries());
  }, [rows]);

  const [selected, setSelected] = useState<string>(markers[0]?.[0] ?? '');

  const data = useMemo(() => {
    return rows
      .filter((r) => r.marker_id === selected)
      .map((r) => ({ date: r.test_date, value: r.value, low: r.range_low, high: r.range_high }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rows, selected]);

  const refLow = data[0]?.low ?? null;
  const refHigh = data[0]?.high ?? null;

  if (markers.length === 0) {
    return <Card><CardContent className="py-12 text-center text-muted-foreground">No data to chart.</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>Trend</CardTitle>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {markers.map(([id, name]) => (<SelectItem key={id} value={id}>{name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              {refLow != null && refHigh != null && (
                <ReferenceArea y1={refLow} y2={refHigh} fill="hsl(var(--primary))" fillOpacity={0.08} />
              )}
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}