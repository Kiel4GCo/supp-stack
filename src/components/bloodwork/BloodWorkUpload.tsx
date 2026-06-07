import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Upload, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBloodMarkers, useSaveReport, extractBloodWork } from '@/hooks/useBloodWork';
import type { ExtractedMarker } from '@/types/bloodwork';

type Draft = ExtractedMarker & { marker_id?: string };

export function BloodWorkUpload({ userId, onSaved }: { userId: string; onSaved?: () => void }) {
  const { data: markers } = useBloodMarkers();
  const saveReport = useSaveReport();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [labName, setLabName] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const matchMarker = (d: Draft) => {
    if (d.key && markers) {
      const byKey = markers.find((m) => m.key === d.key);
      if (byKey) return byKey.id;
    }
    if (markers) {
      const byName = markers.find((m) => m.name.toLowerCase() === d.name.toLowerCase());
      if (byName) return byName.id;
    }
    return undefined;
  };

  const runExtract = async () => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 10MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('bloodwork-uploads').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    setUploading(false);
    if (upErr) {
      toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' });
      return;
    }
    setFilePath(path);
    setExtracting(true);
    try {
      const result = await extractBloodWork(path, file.type);
      if (result.test_date) setTestDate(result.test_date);
      if (result.lab_name) setLabName(result.lab_name);
      const seeded: Draft[] = (result.markers || []).map((m) => ({ ...m, marker_id: undefined }));
      seeded.forEach((d) => (d.marker_id = matchMarker(d)));
      setDrafts(seeded);
      toast({ title: 'Extracted', description: `${seeded.length} marker(s) found. Review and save.` });
    } catch (e: any) {
      toast({ title: 'AI extraction failed', description: e.message, variant: 'destructive' });
    } finally {
      setExtracting(false);
    }
  };

  const updateDraft = (i: number, patch: Partial<Draft>) => {
    setDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  };
  const removeDraft = (i: number) => setDrafts((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    const valid = drafts.filter((d) => d.marker_id && d.value > 0 && d.unit);
    if (valid.length === 0) {
      toast({ title: 'Nothing to save', description: 'Map markers and enter values.', variant: 'destructive' });
      return;
    }
    try {
      await saveReport.mutateAsync({
        userId,
        test_date: testDate,
        lab_name: labName || undefined,
        source: 'upload',
        original_file_path: filePath,
        results: valid.map((d) => ({
          marker_id: d.marker_id!,
          value: Number(d.value),
          unit: d.unit,
          range_low: d.range_low ?? null,
          range_high: d.range_high ?? null,
        })),
      });
      toast({ title: 'Saved', description: `${valid.length} result(s) added.` });
      setDrafts([]);
      setFile(null);
      setFilePath(null);
      onSaved?.();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-3">
          <Label>Lab report (PDF or image, max 10MB)</Label>
          <Input
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button onClick={runExtract} disabled={!file || uploading || extracting}>
            {uploading ? (<><Upload className="h-4 w-4 mr-1 animate-pulse" />Uploading…</>) :
              extracting ? (<><Sparkles className="h-4 w-4 mr-1 animate-pulse" />Extracting…</>) :
              (<><Sparkles className="h-4 w-4 mr-1" />Upload & extract</>)}
          </Button>
        </CardContent>
      </Card>

      {drafts.length > 0 && (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label>Test date</Label>
              <Input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Lab</Label>
              <Input value={labName} onChange={(e) => setLabName(e.target.value)} maxLength={120} />
            </div>
          </div>
          {drafts.map((d, i) => (
            <Card key={i}>
              <CardContent className="pt-4 grid sm:grid-cols-12 gap-2 items-end">
                <div className="sm:col-span-4">
                  <Label>Marker ({d.name})</Label>
                  <Select value={d.marker_id ?? ''} onValueChange={(v) => updateDraft(i, { marker_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Map to catalog marker" /></SelectTrigger>
                    <SelectContent>
                      {markers?.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Value</Label>
                  <Input type="number" step="any" value={d.value} onChange={(e) => updateDraft(i, { value: Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Unit</Label>
                  <Input value={d.unit} onChange={(e) => updateDraft(i, { unit: e.target.value })} maxLength={20} />
                </div>
                <div className="sm:col-span-1">
                  <Label>Low</Label>
                  <Input type="number" step="any" value={d.range_low ?? ''} onChange={(e) => updateDraft(i, { range_low: e.target.value === '' ? undefined : Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>High</Label>
                  <Input type="number" step="any" value={d.range_high ?? ''} onChange={(e) => updateDraft(i, { range_high: e.target.value === '' ? undefined : Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-1">
                  <Button variant="ghost" size="icon" onClick={() => removeDraft(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button onClick={save} disabled={saveReport.isPending}>Save reviewed results</Button>
        </div>
      )}
    </div>
  );
}