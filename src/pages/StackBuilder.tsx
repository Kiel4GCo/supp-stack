import { Layout } from '@/components/layout/Layout';
import { useStack } from '@/hooks/useStack';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock, Sun, Moon, Sunrise } from 'lucide-react';
import { TIMING_LABELS } from '@/types/supplement';

const StackBuilder = () => {
  const { stack, removeFromStack, clearStack } = useStack();

  const morningSupplements = stack.filter(item => 
    item.supplement.optimal_timing.some(t => ['morning', 'empty_stomach'].includes(t))
  );
  const eveningSupplements = stack.filter(item => 
    item.supplement.optimal_timing.some(t => ['evening', 'before_bed'].includes(t))
  );
  const withFoodSupplements = stack.filter(item => 
    item.supplement.optimal_timing.includes('with_food')
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Stack Builder</h1>
            <p className="text-muted-foreground">
              Build and optimize your supplement stack
            </p>
          </div>
          {stack.length > 0 && (
            <Button variant="outline" onClick={clearStack}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {stack.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Your stack is empty. Browse supplements and add them to your stack.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sunrise className="h-5 w-5 text-chart-1" />
                  Morning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {morningSupplements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No morning supplements</p>
                ) : (
                  morningSupplements.map(item => (
                    <div key={item.supplement.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/50">
                      <span className="text-sm font-medium">{item.supplement.name}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFromStack(item.supplement.id)}>
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
              </CardHeader>
              <CardContent className="space-y-2">
                {withFoodSupplements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No meal-time supplements</p>
                ) : (
                  withFoodSupplements.map(item => (
                    <div key={item.supplement.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/50">
                      <span className="text-sm font-medium">{item.supplement.name}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFromStack(item.supplement.id)}>
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
              </CardHeader>
              <CardContent className="space-y-2">
                {eveningSupplements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No evening supplements</p>
                ) : (
                  eveningSupplements.map(item => (
                    <div key={item.supplement.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/50">
                      <span className="text-sm font-medium">{item.supplement.name}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFromStack(item.supplement.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StackBuilder;
