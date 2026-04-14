import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, ArrowRight, LogIn, Clock, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEmailReminderPreferences, useUpsertEmailReminder } from '@/hooks/useEmailReminders';
import { useToast } from '@/hooks/use-toast';

const ALL_DAYS = [
  { key: 'monday', label: 'Mon', index: 1 },
  { key: 'tuesday', label: 'Tue', index: 2 },
  { key: 'wednesday', label: 'Wed', index: 3 },
  { key: 'thursday', label: 'Thu', index: 4 },
  { key: 'friday', label: 'Fri', index: 5 },
  { key: 'saturday', label: 'Sat', index: 6 },
  { key: 'sunday', label: 'Sun', index: 0 },
];

function getNextScheduledTime(reminderTime: string, daysOfWeek: string[]): string | null {
  if (!daysOfWeek.length || !reminderTime) return null;
  const now = new Date();
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const dayNameToIndex: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
  };
  const enabledIndices = daysOfWeek.map(d => dayNameToIndex[d]).filter(d => d !== undefined).sort((a, b) => a - b);
  if (!enabledIndices.length) return null;

  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    candidate.setHours(hours, minutes, 0, 0);
    if (enabledIndices.includes(candidate.getDay()) && candidate > now) {
      return candidate.toLocaleString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    }
  }
  return null;
}

function formatLastSent(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function EmailReminderSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: prefs, isLoading: loadingPrefs } = useEmailReminderPreferences(user?.id);
  const upsert = useUpsertEmailReminder();

  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [days, setDays] = useState<string[]>(ALL_DAYS.map(d => d.key));

  useEffect(() => {
    if (prefs) {
      setEnabled(prefs.enabled);
      setEmail(prefs.email);
      setReminderTime(prefs.reminder_time);
      setDays(prefs.days_of_week);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [prefs, user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await upsert.mutateAsync({
        user_id: user.id,
        enabled,
        email,
        reminder_time: reminderTime,
        days_of_week: days,
      });
      toast({ title: 'Email reminder preferences saved!' });
    } catch {
      toast({ title: 'Failed to save preferences', variant: 'destructive' });
    }
  };

  const toggleDay = (day: string) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Mail className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-medium mb-2">Sign in for email reminders</h3>
          <Button asChild size="sm">
            <Link to="/auth">Sign In <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5 text-primary" />
          Email Reminders
        </CardTitle>
        <CardDescription>
          Get daily email reminders as a backup to push notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-enabled">Enable email reminders</Label>
          <Switch
            id="email-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="reminder-email">Email address</Label>
              <Input
                id="reminder-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-time">Reminder time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Days</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map(d => (
                  <div key={d.key} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`email-day-${d.key}`}
                      checked={days.includes(d.key)}
                      onCheckedChange={() => toggleDay(d.key)}
                    />
                    <Label htmlFor={`email-day-${d.key}`} className="text-sm">{d.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={upsert.isPending} className="w-full">
          {upsert.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
