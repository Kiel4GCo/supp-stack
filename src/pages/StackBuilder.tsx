import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useStack } from '@/hooks/useStack';
import { useStackInteractions } from '@/hooks/useInteractions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trash2, 
  Clock, 
  Sun, 
  Moon, 
  Sunrise, 
  AlertTriangle, 
  Zap,
  ArrowRight,
  Pill,
  Printer,
  Calendar,
  Bell,
  DollarSign,
  CalendarDays,
  BarChart3
} from 'lucide-react';
import { TIMING_LABELS } from '@/types/supplement';
import { cn } from '@/lib/utils';
import { PrintableSchedule } from '@/components/stack/PrintableSchedule';
import { WeeklySchedule, DAYS_OF_WEEK, type SupplementSchedule, type DayOfWeek } from '@/components/stack/WeeklySchedule';
import { ReminderSettings } from '@/components/stack/ReminderSettings';
import { SaveStackDialog } from '@/components/stack/SaveStackDialog';
import { SavedStacksList } from '@/components/stack/SavedStacksList';
import { CostTracker } from '@/components/stack/CostTracker';
import { MonthlyCalendar } from '@/components/stack/MonthlyCalendar';
import { NotificationSettings } from '@/components/stack/NotificationSettings';
import { AdherenceDashboard } from '@/components/stack/AdherenceDashboard';
import { EmailReminderSettings } from '@/components/stack/EmailReminderSettings';
import type { SavedStack } from '@/hooks/useSavedStacks';

const StackBuilder = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { stack, removeFromStack, clearStack, addToStack } = useStack();
  const { toast } = useToast();
  const supplementIds = stack.map(item => item.supplement.id);
  const { data: interactions } = useStackInteractions(supplementIds);

  // Schedule state for each supplement
  const [schedules, setSchedules] = useState<Record<string, SupplementSchedule>>({});

  const morningSupplements = stack.filter(item => 
    item.supplement.optimal_timing.some(t => ['morning', 'empty_stomach'].includes(t))
  );
  const eveningSupplements = stack.filter(item => 
    item.supplement.optimal_timing.some(t => ['evening', 'before_bed'].includes(t))
  );
  const withFoodSupplements = stack.filter(item => 
    item.supplement.optimal_timing.includes('with_food')
  );
  const anytimeSupplements = stack.filter(item => 
    item.supplement.optimal_timing.includes('any_time') &&
    !item.supplement.optimal_timing.some(t => ['morning', 'evening', 'before_bed', 'empty_stomach', 'with_food'].includes(t))
  );

  const hasConflicts = interactions?.conflicts && interactions.conflicts.length > 0;
  const hasSynergies = interactions?.synergies && interactions.synergies.length > 0;

  const handlePrint = () => {
    window.print();
  };

  const handleScheduleChange = useCallback((supplementId: string, updates: Partial<SupplementSchedule>) => {
    setSchedules(prev => ({
      ...prev,
      [supplementId]: {
        supplementId,
        supplementName: stack.find(s => s.supplement.id === supplementId)?.supplement.name || '',
        daysOfWeek: prev[supplementId]?.daysOfWeek || DAYS_OF_WEEK.map(d => d.key) as DayOfWeek[],
        reminderTime: prev[supplementId]?.reminderTime || null,
        ...updates,
      },
    }));
  }, [stack]);

  const handleLoadStack = useCallback((savedStack: SavedStack) => {
    // Clear current stack
    clearStack();
    
    // Load supplements and schedules from saved stack
    const newSchedules: Record<string, SupplementSchedule> = {};
    
    savedStack.items?.forEach(item => {
      if (item.supplement) {
        addToStack(item.supplement as any);
        newSchedules[item.supplement_id] = {
          supplementId: item.supplement_id,
          supplementName: item.supplement.name,
          daysOfWeek: item.days_of_week as DayOfWeek[],
          reminderTime: item.reminder_time,
        };
      }
    });

    setSchedules(newSchedules);
    toast({
      title: 'Stack loaded!',
      description: `Loaded "${savedStack.name}" with ${savedStack.items?.length || 0} supplements.`,
    });
  }, [clearStack, addToStack, toast]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold">Stack Builder</h1>
            <p className="text-muted-foreground">
              Build and optimize your supplement stack
            </p>
          </div>
          {stack.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <SaveStackDialog 
                stack={stack} 
                schedules={schedules} 
              />
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Schedule
              </Button>
              <Button variant="outline" onClick={clearStack}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Interaction Warnings */}
        {hasConflicts && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Interaction Warnings</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {interactions.conflicts.map((conflict, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="font-medium">
                      {conflict.supplement.name} + {conflict.related_supplement.name}:
                    </span>
                    <span>{conflict.description}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Synergies */}
        {hasSynergies && (
          <Alert className="border-chart-1/30 bg-chart-1/5">
            <Zap className="h-4 w-4 text-chart-1" />
            <AlertTitle className="text-chart-1">Synergies Detected</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {interactions.synergies.map((synergy, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="font-medium">
                      {synergy.supplement.name} + {synergy.related_supplement.name}:
                    </span>
                    <span>{synergy.description}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {stack.length === 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="py-12 text-center">
                <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Your stack is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Browse supplements and add them to your stack to get started.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button asChild>
                    <Link to="/">
                      Browse Supplements
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/deficiency-advisor">
                      Find by Symptoms
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <SavedStacksList onLoadStack={handleLoadStack} />
          </div>
        ) : (
          <Tabs defaultValue="daily" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="daily" className="gap-2">
                <Clock className="h-4 w-4" />
                Daily View
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-2">
                <Calendar className="h-4 w-4" />
                Weekly View
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Monthly
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-2">
                <Bell className="h-4 w-4" />
                Reminders
              </TabsTrigger>
              <TabsTrigger value="costs" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Costs
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-6">
              {/* Daily Schedule */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sunrise className="h-5 w-5 text-chart-1" />
                      Morning
                    </CardTitle>
                    <CardDescription>Empty stomach or first thing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {morningSupplements.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No morning supplements</p>
                    ) : (
                      morningSupplements.map(item => (
                        <div 
                          key={item.supplement.id} 
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg bg-chart-1/10",
                            hasConflicts && interactions.conflicts.some(
                              c => c.supplement_id === item.supplement.id || c.related_supplement_id === item.supplement.id
                            ) && "ring-1 ring-destructive"
                          )}
                        >
                          <Link 
                            to={`/supplement/${item.supplement.id}`}
                            className="text-sm font-medium hover:text-primary transition-colors"
                          >
                            {item.supplement.name}
                          </Link>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6" 
                            onClick={() => removeFromStack(item.supplement.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sun className="h-5 w-5 text-chart-2" />
                      With Meals
                    </CardTitle>
                    <CardDescription>Take with food for absorption</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {withFoodSupplements.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No meal-time supplements</p>
                    ) : (
                      withFoodSupplements.map(item => (
                        <div 
                          key={item.supplement.id} 
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg bg-chart-2/10",
                            hasConflicts && interactions.conflicts.some(
                              c => c.supplement_id === item.supplement.id || c.related_supplement_id === item.supplement.id
                            ) && "ring-1 ring-destructive"
                          )}
                        >
                          <Link 
                            to={`/supplement/${item.supplement.id}`}
                            className="text-sm font-medium hover:text-primary transition-colors"
                          >
                            {item.supplement.name}
                          </Link>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6" 
                            onClick={() => removeFromStack(item.supplement.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Moon className="h-5 w-5 text-chart-3" />
                      Evening
                    </CardTitle>
                    <CardDescription>Before bed or with dinner</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {eveningSupplements.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No evening supplements</p>
                    ) : (
                      eveningSupplements.map(item => (
                        <div 
                          key={item.supplement.id} 
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg bg-chart-3/10",
                            hasConflicts && interactions.conflicts.some(
                              c => c.supplement_id === item.supplement.id || c.related_supplement_id === item.supplement.id
                            ) && "ring-1 ring-destructive"
                          )}
                        >
                          <Link 
                            to={`/supplement/${item.supplement.id}`}
                            className="text-sm font-medium hover:text-primary transition-colors"
                          >
                            {item.supplement.name}
                          </Link>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6" 
                            onClick={() => removeFromStack(item.supplement.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-chart-4" />
                      Any Time
                    </CardTitle>
                    <CardDescription>Flexible timing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {anytimeSupplements.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No flexible supplements</p>
                    ) : (
                      anytimeSupplements.map(item => (
                        <div 
                          key={item.supplement.id} 
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg bg-chart-4/10",
                            hasConflicts && interactions.conflicts.some(
                              c => c.supplement_id === item.supplement.id || c.related_supplement_id === item.supplement.id
                            ) && "ring-1 ring-destructive"
                          )}
                        >
                          <Link 
                            to={`/supplement/${item.supplement.id}`}
                            className="text-sm font-medium hover:text-primary transition-colors"
                          >
                            {item.supplement.name}
                          </Link>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6" 
                            onClick={() => removeFromStack(item.supplement.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Full Stack List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Supplements ({stack.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stack.map(item => (
                      <div 
                        key={item.supplement.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Link 
                            to={`/supplement/${item.supplement.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {item.supplement.name}
                          </Link>
                          <div className="flex gap-1">
                            {item.supplement.optimal_timing.slice(0, 2).map(t => (
                              <Badge key={t} variant="secondary" className="text-xs">
                                {TIMING_LABELS[t]}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => removeFromStack(item.supplement.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-6">
              <WeeklySchedule
                stack={stack}
                schedules={schedules}
                onScheduleChange={handleScheduleChange}
              />
              <SavedStacksList onLoadStack={handleLoadStack} />
            </TabsContent>

            <TabsContent value="monthly" className="space-y-6">
              <MonthlyCalendar stack={stack} />
              <SavedStacksList onLoadStack={handleLoadStack} />
            </TabsContent>

            <TabsContent value="reminders" className="space-y-6">
              <ReminderSettings
                stack={stack}
                schedules={schedules}
                onScheduleChange={handleScheduleChange}
              />
              <NotificationSettings
                stack={stack}
                schedules={schedules}
              />
              <EmailReminderSettings />
              <SavedStacksList onLoadStack={handleLoadStack} />
            </TabsContent>

            <TabsContent value="costs" className="space-y-6">
              <CostTracker
                stack={stack}
                schedules={schedules}
              />
              <SavedStacksList onLoadStack={handleLoadStack} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AdherenceDashboard stack={stack} />
              <SavedStacksList onLoadStack={handleLoadStack} />
            </TabsContent>
          </Tabs>
        )}

        {/* Printable Schedule (hidden on screen, visible when printing) */}
        <PrintableSchedule
          ref={printRef}
          stack={stack}
          morningSupplements={morningSupplements}
          withFoodSupplements={withFoodSupplements}
          eveningSupplements={eveningSupplements}
          anytimeSupplements={anytimeSupplements}
        />
      </div>
    </Layout>
  );
};

export default StackBuilder;
