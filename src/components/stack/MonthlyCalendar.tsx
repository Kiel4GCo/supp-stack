import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Calendar as CalendarIcon,
  Loader2 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdherenceLogs, useLogAdherence } from '@/hooks/useAdherence';
import { cn } from '@/lib/utils';
import type { StackItem } from '@/types/supplement';
import type { SavedStack } from '@/hooks/useSavedStacks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MonthlyCalendarProps {
  stack: StackItem[];
  savedStack?: SavedStack | null;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthlyCalendar({ stack, savedStack }: MonthlyCalendarProps) {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const { data: adherenceLogs, isLoading } = useAdherenceLogs(
    user?.id,
    format(monthStart, 'yyyy-MM-dd'),
    format(monthEnd, 'yyyy-MM-dd')
  );
  
  const logAdherence = useLogAdherence();

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const getDayStatus = (date: Date) => {
    if (!adherenceLogs || stack.length === 0) return { taken: 0, missed: 0, total: 0 };
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const logsForDay = adherenceLogs.filter(log => log.logged_date === dateStr);
    
    const taken = logsForDay.filter(log => log.taken).length;
    const missed = logsForDay.filter(log => !log.taken).length;
    
    return { taken, missed, total: logsForDay.length };
  };

  const handleLogDay = async (supplementId: string, date: Date, taken: boolean) => {
    if (!user) return;
    
    try {
      await logAdherence.mutateAsync({
        userId: user.id,
        supplementId,
        loggedDate: format(date, 'yyyy-MM-dd'),
        taken,
      });
    } catch (error) {
      console.error('Error logging adherence:', error);
    }
  };

  const getSupplementLogForDate = (supplementId: string, date: Date) => {
    if (!adherenceLogs) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return adherenceLogs.find(
      log => log.supplement_id === supplementId && log.logged_date === dateStr
    );
  };

  // Calculate adherence rate for the month
  const adherenceRate = useMemo(() => {
    if (!adherenceLogs || adherenceLogs.length === 0) return null;
    
    const taken = adherenceLogs.filter(log => log.taken).length;
    const total = adherenceLogs.length;
    
    return Math.round((taken / total) * 100);
  }, [adherenceLogs]);

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Track Your Progress</h3>
          <p className="text-muted-foreground">
            Sign in to track which days you've taken your supplements
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Adherence Tracker
              </CardTitle>
              <CardDescription>
                Track which days you've taken your supplements
              </CardDescription>
            </div>
            {adherenceRate !== null && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm",
                  adherenceRate >= 80 && "border-chart-1 text-chart-1",
                  adherenceRate >= 50 && adherenceRate < 80 && "border-chart-2 text-chart-2",
                  adherenceRate < 50 && "border-destructive text-destructive"
                )}
              >
                {adherenceRate}% adherence
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday Headers */}
            {WEEKDAYS.map(day => (
              <div 
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map(day => {
              const status = getDayStatus(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isPast = day < new Date() && !isToday(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  disabled={!isCurrentMonth}
                  className={cn(
                    "aspect-square p-1 rounded-lg text-sm relative transition-colors",
                    "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
                    !isCurrentMonth && "text-muted-foreground/30 cursor-not-allowed",
                    isToday(day) && "ring-2 ring-primary",
                    isSelected && "bg-primary/20"
                  )}
                >
                  <div className="font-medium">{format(day, 'd')}</div>
                  
                  {/* Status Indicators */}
                  {isCurrentMonth && status.total > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {status.taken > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-chart-1" />
                      )}
                      {status.missed > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      )}
                    </div>
                  )}
                  
                  {/* Empty/Not logged indicator for past days */}
                  {isCurrentMonth && isPast && status.total === 0 && stack.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-chart-1" />
              <span>Taken</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span>Not logged</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              Mark which supplements you took on this day
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {stack.map(item => {
                const log = selectedDate 
                  ? getSupplementLogForDate(item.supplement.id, selectedDate)
                  : null;
                
                return (
                  <div 
                    key={item.supplement.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={log?.taken ?? false}
                        onCheckedChange={(checked) => {
                          if (selectedDate) {
                            handleLogDay(item.supplement.id, selectedDate, !!checked);
                          }
                        }}
                        disabled={logAdherence.isPending}
                      />
                      <span className="font-medium">{item.supplement.name}</span>
                    </div>
                    {log && (
                      <Badge variant={log.taken ? 'default' : 'destructive'}>
                        {log.taken ? (
                          <><Check className="h-3 w-3 mr-1" />Taken</>
                        ) : (
                          <><X className="h-3 w-3 mr-1" />Missed</>
                        )}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {logAdherence.isPending && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
