import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SupplementCategory } from '@/types/supplement';
import { CATEGORY_LABELS } from '@/types/supplement';

interface SearchAndFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: SupplementCategory | undefined;
  onCategoryChange: (category: SupplementCategory | undefined) => void;
}

const categories: SupplementCategory[] = [
  'vitamins',
  'minerals',
  'amino_acids',
  'herbs',
  'probiotics',
  'omega_fatty_acids',
  'antioxidants',
  'adaptogens',
  'enzymes',
  'other',
];

export function SearchAndFilter({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: SearchAndFilterProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search supplements..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter:</span>
        </div>
        
        <Button
          variant={selectedCategory === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(undefined)}
          className="h-7"
        >
          All
        </Button>

        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className="h-7"
          >
            {CATEGORY_LABELS[category]}
          </Button>
        ))}
      </div>
    </div>
  );
}
