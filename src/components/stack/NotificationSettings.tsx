import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellOff, BellRing, Check, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import type { StackItem } from '@/types/supplement';
import type { SupplementSchedule } from './WeeklySchedule';

interface NotificationSettingsProps {
  stack: StackItem[];
  schedules: Record<string, SupplementSchedule>;
}

export function NotificationSettings({ stack, schedules }: NotificationSettingsProps) {
  const { isSupported, permission, requestPermission, scheduleReminder } = useNotifications();
  const [scheduledReminders, setScheduledReminders] = useState<ReturnType<typeof setTimeout>[]>([]);

  // Schedule reminders when permission is granted and schedules change
  useEffect(() => {
    if (permission !== 'granted') return;

    // Clear existing timeouts
    scheduledReminders.forEach(id => clearTimeout(id));
    
    const newReminders: ReturnType<typeof setTimeout>[] = [];
    
    Object.values(schedules).forEach(schedule => {
      if (schedule.reminderTime && schedule.daysOfWeek.length > 0) {
        const timeoutId = scheduleReminder(
          schedule.supplementName,
          schedule.reminderTime,
          schedule.daysOfWeek
        );
        if (timeoutId) {
          newReminders.push(timeoutId);
        }
      }
    });

    setScheduledReminders(newReminders);

    return () => {
      newReminders.forEach(id => clearTimeout(id));
    };
  }, [permission, schedules, scheduleReminder]);

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const supplementsWithReminders = Object.values(schedules).filter(
    s => s.reminderTime && s.daysOfWeek.length > 0
  );

  if (!isSupported) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Your browser doesn't support push notifications. Try using a modern browser like Chrome, Firefox, or Edge.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get browser notifications for your supplement reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            {permission === 'granted' ? (
              <BellRing className="h-5 w-5 text-chart-1" />
            ) : permission === 'denied' ? (
              <BellOff className="h-5 w-5 text-destructive" />
            ) : (
              <Bell className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <div className="font-medium">
                {permission === 'granted' && 'Notifications enabled'}
                {permission === 'denied' && 'Notifications blocked'}
                {permission === 'default' && 'Notifications not enabled'}
              </div>
              <div className="text-sm text-muted-foreground">
                {permission === 'granted' && 'You will receive reminders at your scheduled times'}
                {permission === 'denied' && 'Please enable notifications in your browser settings'}
                {permission === 'default' && 'Enable notifications to get reminders'}
              </div>
            </div>
          </div>
          
          {permission === 'default' && (
            <Button onClick={handleRequestPermission}>
              Enable
            </Button>
          )}
          
          {permission === 'granted' && (
            <Badge variant="outline" className="text-chart-1 border-chart-1">
              <Check className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>

        {/* Scheduled Reminders */}
        {permission === 'granted' && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Active Reminders ({supplementsWithReminders.length})
            </div>
            
            {supplementsWithReminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reminders set. Add reminder times in the Reminders tab.
              </p>
            ) : (
              <div className="space-y-2">
                {supplementsWithReminders.map(schedule => (
                  <div 
                    key={schedule.supplementId}
                    className="flex items-center justify-between p-3 rounded-lg bg-chart-1/10"
                  >
                    <div>
                      <div className="font-medium text-sm">{schedule.supplementName}</div>
                      <div className="text-xs text-muted-foreground">
                        {schedule.daysOfWeek.join(', ')}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {schedule.reminderTime}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructions for denied */}
        {permission === 'denied' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">How to enable notifications:</p>
              <ol className="list-decimal list-inside text-sm space-y-1">
                <li>Click the lock icon in your browser address bar</li>
                <li>Find Notifications in the permissions</li>
                <li>Change it from Block to Allow</li>
                <li>Refresh this page</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
