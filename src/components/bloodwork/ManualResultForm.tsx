import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBloodMarkers, useSaveReport } from '@/hooks/useBloodWork';

interface Row {
  marker_id: string;
  value: string;
  unit: string;
  range_low: string;
  range_high: string;
}

const rowSchema = z.object({
  marker_id: z.string().uuid({ message: 'Pick a marker' }),
  value: z.coerce.number().positive('Value must be > 0'),
  unit: z.string().trim().min(1).max(20),
  range_low: z.union([z.literal(''), z.coerce.number().nonnegative()]),
  range_high: z.union([z.literal(''), z.coerce.number().positive()]),
});

const reportSchema = z.object({
  test_date: z.string().refine((d) => !!d && new Date(d) <= new Date(), 'Date must not be in the future'),
  lab_name: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export function ManualResultForm({ userId, onSaved }: { userId: string; onSaved?: () => void }) {
  const { data: markers } = useBloodMarkers();
  const saveReport = useSaveReport();
  const { toast } = useToast();
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [labName, setLabName] = useState('');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<Row[]>([
    { marker_id: '', value: '', unit: '', range_low: '', range_high: '' },
  ]);

  const updateRow = (i: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, { marker_id: '', value: '', unit: '', range_low: '', range_high: '' }]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleMarker = (i: number, marker_id: string) => {
    const m = markers?.find((x) => x.id === marker_id);
    updateRow(i, { marker_id, unit: rows[i].unit || m?.default_unit || '' });
  };

  const submit = async () => {
    const header = reportSchema.safeParse({ test_date: testDate, lab_name: labName, notes });
    if (!header.success) {
      toast({ title: 'Invalid', description: header.error.issues[0].message, variant: 'destructive' });
      return;
    }
    const parsedRows: any[] = [];
    for (const [i, r] of rows.entries()) {
      const result = rowSchema.safeParse(r);
      if (!result.success) {
        toast({ title: `Row ${i + 1}`, description: result.error.issues[0].message, variant: 'destructive' });
        return;
      }
      parsedRows.push({
        marker_id: result.data.marker_id,
        value: result.data.value,
        unit: result.data.unit,
        range_low: result.data.range_low === '' ? null : (result.data.range_low as number),
        range_high: result.data.range_high === '' ? null : (result.data.range_high as number),
      });
    }

    try {
      await saveReport.mutateAsync({
        userId,
        test_date: testDate,
        lab_name: labName || undefined,
        notes: notes || undefined,
        source: 'manual',
        results: parsedRows,
      });
      toast({ title: 'Saved', description: `${parsedRows.length} result(s) added.` });
      setRows([{ marker_id: '', value: '', unit: '', range_low: '', range_high: '' }]);
      setLabName('');
      setNotes('');
      onSaved?.();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label>Test date</Label>
          <Input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Lab (optional)</Label>
          <Input value={labName} onChange={(e) => setLabName(e.target.value)} maxLength={120} />
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row, i) => (
          <Card key={i}>
            <CardContent className="pt-4 grid sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-4">
                <Label>Marker</Label>
                <Select value={row.marker_id} onValueChange={(v) => handleMarker(i, v)}>
                  <SelectTrigger><SelectValue placeholder="Pick a marker" /></SelectTrigger>
                  <SelectContent>
                    {markers?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Value</Label>
                <Input type="number" step="any" value={row.value} onChange={(e) => updateRow(i, { value: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Unit</Label>
                <Input value={row.unit} onChange={(e) => updateRow(i, { unit: e.target.value })} maxLength={20} />
              </div>
              <div className="sm:col-span-1">
                <Label>Low</Label>
                <Input type="number" step="any" value={row.range_low} onChange={(e) => updateRow(i, { range_low: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>High</Label>
                <Input type="number" step="any" value={row.range_high} onChange={(e) => updateRow(i, { range_high: e.target.value })} />
              </div>
              <div className="sm:col-span-1">
                <Button variant="ghost" size="icon" onClick={() => removeRow(i)} disabled={rows.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={addRow}><Plus className="h-4 w-4 mr-1" />Add marker</Button>
      </div>

      <div>
        <Label>Notes (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
      </div>

      <Button onClick={submit} disabled={saveReport.isPending}>
        {saveReport.isPending ? 'Saving…' : 'Save results'}
      </Button>
    </div>
  );
}