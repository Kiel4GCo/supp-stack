import { Link } from 'react-router-dom';
import { Plus, Check, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Supplement } from '@/types/supplement';
import { CATEGORY_LABELS, TIMING_LABELS, EVIDENCE_LABELS } from '@/types/supplement';

interface SupplementCardProps {
  supplement: Supplement;
  isInStack?: boolean;
  onAddToStack?: (supplement: Supplement) => void;
  onRemoveFromStack?: (supplementId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  vitamins: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  minerals: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  amino_acids: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  herbs: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  adaptogens: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  probiotics: 'bg-primary/10 text-primary border-primary/20',
  omega_fatty_acids: 'bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20',
  antioxidants: 'bg-destructive/10 text-destructive border-destructive/20',
  enzymes: 'bg-secondary/10 text-secondary border-secondary/20',
  other: 'bg-muted/50 text-muted-foreground border-muted',
};

const EVIDENCE_COLORS: Record<string, string> = {
  strong: 'bg-chart-1/10 text-chart-1',
  emerging: 'bg-chart-2/10 text-chart-2',
  limited: 'bg-chart-5/10 text-chart-5',
};

export function SupplementCard({
  supplement,
  isInStack,
  onAddToStack,
  onRemoveFromStack,
}: SupplementCardProps) {
  const handleStackToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInStack) {
      onRemoveFromStack?.(supplement.id);
    } else {
      onAddToStack?.(supplement);
    }
  };

  return (
    <Link to={`/supplement/${supplement.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {supplement.name}
              </h3>
              <Badge 
                variant="outline" 
                className={cn('text-xs', CATEGORY_COLORS[supplement.category])}
              >
                {CATEGORY_LABELS[supplement.category]}
              </Badge>
            </div>
            {(onAddToStack || onRemoveFromStack) && (
              <Button
                size="icon"
                variant={isInStack ? 'default' : 'outline'}
                className="shrink-0 h-8 w-8"
                onClick={handleStackToggle}
              >
                {isInStack ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {supplement.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5">
            {supplement.benefits.slice(0, 2).map((benefit) => (
              <Badge key={benefit} variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {benefit}
              </Badge>
            ))}
            {supplement.benefits.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{supplement.benefits.length - 2} more
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {supplement.optimal_timing.slice(0, 2).map(t => TIMING_LABELS[t]).join(', ')}
          </div>
          <Badge variant="secondary" className={cn('text-xs', EVIDENCE_COLORS[supplement.evidence_level])}>
            {EVIDENCE_LABELS[supplement.evidence_level]}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
