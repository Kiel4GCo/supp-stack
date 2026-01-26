import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { StackItem } from '@/types/supplement';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number]['key'];

export interface SupplementSchedule {
  supplementId: string;
  supplementName: string;
  daysOfWeek: DayOfWeek[];
  reminderTime: string | null;
}

interface WeeklyScheduleProps {
  stack: StackItem[];
  schedules: Record<string, SupplementSchedule>;
  onScheduleChange: (supplementId: string, schedule: Partial<SupplementSchedule>) => void;
  editable?: boolean;
}

export function WeeklySchedule({ 
  stack, 
  schedules, 
  onScheduleChange,
  editable = true 
}: WeeklyScheduleProps) {
  // Group supplements by day
  const supplementsByDay = useMemo(() => {
    const byDay: Record<DayOfWeek, StackItem[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    stack.forEach(item => {
      const schedule = schedules[item.supplement.id];
      const days = schedule?.daysOfWeek || DAYS_OF_WEEK.map(d => d.key);
      
      days.forEach(day => {
        if (byDay[day]) {
          byDay[day].push(item);
        }
      });
    });

    return byDay;
  }, [stack, schedules]);

  const toggleDay = (supplementId: string, day: DayOfWeek) => {
    if (!editable) return;
    
    const currentSchedule = schedules[supplementId];
    const currentDays = currentSchedule?.daysOfWeek || DAYS_OF_WEEK.map(d => d.key);
    
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    // Ensure at least one day is selected
    if (newDays.length === 0) return;
    
    onScheduleChange(supplementId, { daysOfWeek: newDays });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b font-medium text-muted-foreground">
                  Supplement
                </th>
                {DAYS_OF_WEEK.map(day => (
                  <th 
                    key={day.key} 
                    className="p-2 border-b text-center font-medium text-muted-foreground min-w-[60px]"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stack.map(item => {
                const schedule = schedules[item.supplement.id];
                const activeDays = schedule?.daysOfWeek || DAYS_OF_WEEK.map(d => d.key);
                const reminderTime = schedule?.reminderTime;

                return (
                  <tr key={item.supplement.id} className="hover:bg-muted/30">
                    <td className="p-2 border-b">
                      <div className="flex flex-col gap-1">
                        <Link 
                          to={`/supplement/${item.supplement.id}`}
                          className="font-medium hover:text-primary transition-colors text-sm"
                        >
                          {item.supplement.name}
                        </Link>
                        {reminderTime && (
                          <Badge variant="secondary" className="text-xs w-fit">
                            ⏰ {reminderTime}
                          </Badge>
                        )}
                      </div>
                    </td>
                    {DAYS_OF_WEEK.map(day => {
                      const isActive = activeDays.includes(day.key);
                      return (
                        <td 
                          key={day.key} 
                          className={cn(
                            "p-2 border-b text-center",
                            isActive ? "bg-primary/10" : ""
                          )}
                        >
                          {editable ? (
                            <Checkbox 
                              checked={isActive}
                              onCheckedChange={() => toggleDay(item.supplement.id, day.key)}
                              className="mx-auto"
                            />
                          ) : (
                            isActive && (
                              <span className="text-primary">●</span>
                            )
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {stack.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No supplements in your stack yet
          </p>
        )}

        {/* Day Summary */}
        {stack.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map(day => (
              <div 
                key={day.key}
                className="p-3 rounded-lg bg-muted/30 text-center"
              >
                <div className="font-medium text-sm">{day.label}</div>
                <div className="text-2xl font-bold text-primary">
                  {supplementsByDay[day.key].length}
                </div>
                <div className="text-xs text-muted-foreground">supplements</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { DAYS_OF_WEEK };
