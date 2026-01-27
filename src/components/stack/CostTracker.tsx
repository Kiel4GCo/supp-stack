import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Package } from 'lucide-react';
import type { StackItem } from '@/types/supplement';
import type { SupplementSchedule } from './WeeklySchedule';

interface CostTrackerProps {
  stack: StackItem[];
  schedules: Record<string, SupplementSchedule>;
}

interface SupplementCost {
  name: string;
  daysPerWeek: number;
  servingsPerDay: number;
  costPerServing: number;
  monthlyCost: number;
  yearlyCost: number;
}

// Default cost estimates if not set in database
const DEFAULT_COSTS: Record<string, { costPerUnit: number; unitsPerContainer: number }> = {
  'vitamins': { costPerUnit: 0.15, unitsPerContainer: 90 },
  'minerals': { costPerUnit: 0.12, unitsPerContainer: 120 },
  'amino_acids': { costPerUnit: 0.35, unitsPerContainer: 60 },
  'herbs': { costPerUnit: 0.25, unitsPerContainer: 60 },
  'probiotics': { costPerUnit: 0.50, unitsPerContainer: 30 },
  'omega_fatty_acids': { costPerUnit: 0.30, unitsPerContainer: 120 },
  'antioxidants': { costPerUnit: 0.20, unitsPerContainer: 60 },
  'adaptogens': { costPerUnit: 0.40, unitsPerContainer: 60 },
  'enzymes': { costPerUnit: 0.25, unitsPerContainer: 90 },
  'other': { costPerUnit: 0.20, unitsPerContainer: 60 },
};

export function CostTracker({ stack, schedules }: CostTrackerProps) {
  const costs = useMemo(() => {
    return stack.map((item): SupplementCost => {
      const schedule = schedules[item.supplement.id];
      const daysPerWeek = schedule?.daysOfWeek?.length || 7;
      const servingsPerDay = 1; // Default to 1 serving per day
      
      // Get cost from supplement data or use default based on category
      const supplementData = item.supplement as any;
      const costPerServing = supplementData.cost_per_unit 
        ? Number(supplementData.cost_per_unit)
        : DEFAULT_COSTS[item.supplement.category]?.costPerUnit || 0.20;
      
      // Calculate weekly servings
      const weeklyServings = daysPerWeek * servingsPerDay;
      const weeklyCost = weeklyServings * costPerServing;
      
      // Monthly = ~4.33 weeks
      const monthlyCost = weeklyCost * 4.33;
      const yearlyCost = weeklyCost * 52;

      return {
        name: item.supplement.name,
        daysPerWeek,
        servingsPerDay,
        costPerServing,
        monthlyCost,
        yearlyCost,
      };
    });
  }, [stack, schedules]);

  const totals = useMemo(() => {
    const monthly = costs.reduce((sum, c) => sum + c.monthlyCost, 0);
    const yearly = costs.reduce((sum, c) => sum + c.yearlyCost, 0);
    return { monthly, yearly };
  }, [costs]);

  if (stack.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cost Tracker
        </CardTitle>
        <CardDescription>
          Estimated costs based on your supplement schedule
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground">Monthly Cost</div>
            <div className="text-2xl font-bold text-primary">
              ${totals.monthly.toFixed(2)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-chart-2/10 border border-chart-2/20">
            <div className="text-sm text-muted-foreground">Yearly Cost</div>
            <div className="text-2xl font-bold text-chart-2">
              ${totals.yearly.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Per-supplement breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Breakdown by Supplement</div>
          {costs.map((cost) => (
            <div 
              key={cost.name}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{cost.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {cost.daysPerWeek} days/week × ${cost.costPerServing.toFixed(2)}/serving
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  ${cost.monthlyCost.toFixed(2)}/mo
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Savings tip */}
        <div className="p-3 rounded-lg bg-chart-1/10 border border-chart-1/20">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-chart-1 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium text-chart-1">Tip: </span>
              <span className="text-muted-foreground">
                Buying supplements in bulk or subscribing to monthly deliveries can reduce costs by 15-30%.
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
