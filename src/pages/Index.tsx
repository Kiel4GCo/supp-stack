import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SupplementGrid } from '@/components/supplements/SupplementGrid';
import { SearchAndFilter } from '@/components/supplements/SearchAndFilter';
import { useSupplements } from '@/hooks/useSupplements';
import { useStack } from '@/hooks/useStack';
import type { SupplementCategory } from '@/types/supplement';

const Index = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<SupplementCategory | undefined>();
  
  const { data: supplements, isLoading } = useSupplements({ search, category });
  const { isInStack, addToStack, removeFromStack } = useStack();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold">Supplement Database</h1>
          <p className="text-muted-foreground">
            Explore evidence-based information on vitamins, minerals, and more.
          </p>
        </div>

        <SearchAndFilter
          search={search}
          onSearchChange={setSearch}
          selectedCategory={category}
          onCategoryChange={setCategory}
        />

        <SupplementGrid
          supplements={supplements}
          isLoading={isLoading}
          isInStack={isInStack}
          onAddToStack={addToStack}
          onRemoveFromStack={removeFromStack}
        />
      </div>
    </Layout>
  );
};

export default Index;
