import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Bell, Clock, X } from 'lucide-react';
import type { StackItem } from '@/types/supplement';
import type { SupplementSchedule } from './WeeklySchedule';

interface ReminderSettingsProps {
  stack: StackItem[];
  schedules: Record<string, SupplementSchedule>;
  onScheduleChange: (supplementId: string, schedule: Partial<SupplementSchedule>) => void;
}

export function ReminderSettings({ 
  stack, 
  schedules, 
  onScheduleChange 
}: ReminderSettingsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState('');

  const handleSetReminder = (supplementId: string) => {
    if (tempTime) {
      onScheduleChange(supplementId, { reminderTime: tempTime });
    }
    setEditingId(null);
    setTempTime('');
  };

  const handleRemoveReminder = (supplementId: string) => {
    onScheduleChange(supplementId, { reminderTime: null });
  };

  const supplementsWithReminders = stack.filter(
    item => schedules[item.supplement.id]?.reminderTime
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          Dosage Reminders
        </CardTitle>
        <CardDescription>
          Set reminder times for each supplement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stack.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Add supplements to your stack to set reminders
          </p>
        ) : (
          <div className="space-y-3">
            {stack.map(item => {
              const schedule = schedules[item.supplement.id];
              const reminderTime = schedule?.reminderTime;

              return (
                <div 
                  key={item.supplement.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-sm">
                        {item.supplement.name}
                      </div>
                      {reminderTime && (
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {reminderTime}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5"
                            onClick={() => handleRemoveReminder(item.supplement.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Dialog 
                    open={editingId === item.supplement.id} 
                    onOpenChange={(open) => {
                      if (open) {
                        setEditingId(item.supplement.id);
                        setTempTime(reminderTime || '08:00');
                      } else {
                        setEditingId(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Clock className="h-4 w-4 mr-1" />
                        {reminderTime ? 'Edit' : 'Set Time'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[300px]">
                      <DialogHeader>
                        <DialogTitle>Set Reminder Time</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="reminder-time">
                            Reminder time for {item.supplement.name}
                          </Label>
                          <Input
                            id="reminder-time"
                            type="time"
                            value={tempTime}
                            onChange={(e) => setTempTime(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={() => handleSetReminder(item.supplement.id)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary of reminders */}
        {supplementsWithReminders.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Active Reminders</h4>
            <div className="flex flex-wrap gap-2">
              {supplementsWithReminders
                .sort((a, b) => {
                  const timeA = schedules[a.supplement.id]?.reminderTime || '';
                  const timeB = schedules[b.supplement.id]?.reminderTime || '';
                  return timeA.localeCompare(timeB);
                })
                .map(item => (
                  <Badge key={item.supplement.id} variant="secondary">
                    {schedules[item.supplement.id]?.reminderTime} - {item.supplement.name}
                  </Badge>
                ))
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
