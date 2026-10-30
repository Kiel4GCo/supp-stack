import { useEffect, useRef, useState } from 'react';
import { FileUp, Loader2, Sparkles, Square, Trash2, Copy, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { MAX_LOG_LENGTH, redactLogs } from '../../../supabase/functions/analyze-ci-logs/security';

export function CIFailureAnalyzer() {
  const [logs, setLogs] = useState('');
  const [context, setContext] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [paused, setPaused] = useState(false);
  const [resume, setResume] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);

  async function analyze() {
    if (!logs.trim() || logs.length > MAX_LOG_LENGTH || context.length > 2000) return;
    setBusy(true); setError(''); setOutput(''); setCopied(false);
    const controller = new AbortController(); abort.current = controller;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sign in to analyze CI logs.');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-ci-logs`, {
        method: 'POST', signal: controller.signal,
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: redactLogs(logs), context: redactLogs(context), resume }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (response.status === 402 || response.status === 403) setPaused(true);
        throw new Error(payload.error || 'CI analysis is unavailable.');
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No analysis stream was returned.');
      const decoder = new TextDecoder(); let buffer = ''; let done = false;
      const handle = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === 'text') setOutput(previous => previous + event.text);
        if (event.type === 'done') { done = true; setPaused(false); setResume(false); }
        if (event.type === 'error') {
          if (event.status === 402 || event.status === 403) setPaused(true);
          throw new Error(event.message);
        }
      };
      try {
        while (true) {
          const chunk = await reader.read();
          buffer += decoder.decode(chunk.value, { stream: !chunk.done });
          const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
          lines.forEach(handle);
          if (chunk.done) break;
        }
        handle(buffer);
        if (!done) throw new Error('The analysis ended before completion.');
      } finally { await reader.cancel().catch(() => {}); }
    } catch (e) {
      setError(controller.signal.aborted ? 'Analysis stopped.' : e instanceof Error ? e.message : 'Analysis failed.');
    } finally { setBusy(false); abort.current = null; }
  }

  return (
    <section className="space-y-4 border-t border-border pt-6" aria-labelledby="ci-analyzer-title">
      <div className="flex items-center gap-2"><Terminal className="h-5 w-5 text-primary" /><h2 id="ci-analyzer-title" className="text-2xl font-serif font-bold">CI Failure Analyzer</h2></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 min-w-0">
          <div className="space-y-2"><Label htmlFor="ci-context">Job / workflow context (optional)</Label><Textarea id="ci-context" value={context} onChange={e => setContext(e.target.value)} maxLength={2000} disabled={busy} placeholder="Workflow name, failing step, recent dependency changes…" /></div>
          <div className="space-y-2"><div className="flex items-center justify-between gap-2"><Label htmlFor="ci-logs">Failure logs</Label><span className="text-xs text-muted-foreground">{logs.length.toLocaleString()} / 60,000</span></div><Textarea id="ci-logs" value={logs} onChange={e => setLogs(e.target.value)} maxLength={MAX_LOG_LENGTH} disabled={busy} className="min-h-72 font-mono text-xs" placeholder="Paste the failing job output…" /></div>
          <p className="text-xs text-muted-foreground">Remove sensitive data before submitting. Common credentials are masked, but redaction is not guaranteed. Submitted excerpts are sent to Lovable AI; this app does not save them. AI usage may consume workspace credits.</p>
          <input ref={fileInput} type="file" accept=".txt,.log,text/plain" className="hidden" aria-label="Upload CI log file" onChange={async e => {
            const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
            if (file.size > MAX_LOG_LENGTH * 4) { setError('File is too large. Upload a failing job excerpt.'); return; }
            try { const text = await file.text(); if (text.length > MAX_LOG_LENGTH) throw new Error('Logs exceed 60,000 characters. Submit a shorter excerpt.'); setLogs(text); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to read file.'); }
          }} />
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={analyze} disabled={busy || !logs.trim() || (paused && !resume)}><Sparkles className="mr-2 h-4 w-4" />Analyze logs</Button>
            {busy ? <Button variant="outline" onClick={() => abort.current?.abort()}><Square className="mr-2 h-4 w-4" />Stop</Button> : <><Button variant="outline" onClick={() => fileInput.current?.click()}><FileUp className="mr-2 h-4 w-4" />Upload logs</Button><Button variant="ghost" size="icon" aria-label="Clear analysis" title="Clear analysis" onClick={() => { setLogs(''); setContext(''); setOutput(''); setError(''); }}><Trash2 className="h-4 w-4" /></Button></>}
          </div>
          {paused && <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={resume} onChange={e => setResume(e.target.checked)} />I have restored AI access and want to start a fresh analysis.</label>}
          {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
        </div>
        <div className="min-w-0 space-y-3" aria-busy={busy}>
          <div className="flex min-h-9 items-center justify-between"><h3 className="font-semibold">Diagnosis</h3>{output && <Button variant="ghost" size="sm" disabled={busy} onClick={async () => { try { await navigator.clipboard.writeText(output); setCopied(true); } catch { setError('Unable to copy the diagnosis.'); } }}><Copy className="mr-2 h-4 w-4" />{copied ? 'Copied' : 'Copy'}</Button>}</div>
          {busy && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />Analyzing failure…</p>}
          {output ? <pre className="whitespace-pre-wrap break-words rounded-md border border-border bg-card p-4 font-sans text-sm leading-relaxed">{output}</pre> : !busy && <p className="text-sm text-muted-foreground">No diagnosis yet.</p>}
          {output && <p className="text-xs text-muted-foreground">AI suggestions may be incorrect. Review changes before applying them; nothing is changed automatically.</p>}
        </div>
      </div>
    </section>
  );
}