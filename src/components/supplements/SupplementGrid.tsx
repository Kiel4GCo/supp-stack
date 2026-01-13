import { SupplementCard } from './SupplementCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Supplement } from '@/types/supplement';

interface SupplementGridProps {
  supplements: Supplement[] | undefined;
  isLoading: boolean;
  isInStack?: (supplementId: string) => boolean;
  onAddToStack?: (supplement: Supplement) => void;
  onRemoveFromStack?: (supplementId: string) => void;
}

export function SupplementGrid({
  supplements,
  isLoading,
  isInStack,
  onAddToStack,
  onRemoveFromStack,
}: SupplementGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!supplements?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No supplements found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {supplements.map((supplement) => (
        <SupplementCard
          key={supplement.id}
          supplement={supplement}
          isInStack={isInStack?.(supplement.id)}
          onAddToStack={onAddToStack}
          onRemoveFromStack={onRemoveFromStack}
        />
      ))}
    </div>
  );
}
