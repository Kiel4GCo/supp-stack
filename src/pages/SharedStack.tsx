import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  User, 
  Package,
  AlertTriangle,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TIMING_LABELS, CATEGORY_LABELS } from '@/types/supplement';
import { useStack } from '@/hooks/useStack';
import { useToast } from '@/hooks/use-toast';

export default function SharedStack() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { addToStack } = useStack();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImport = () => {
    if (!stack?.items?.length) return;
    let imported = 0;
    stack.items.forEach((item: any) => {
      if (item.supplement) {
        addToStack(item.supplement);
        imported++;
      }
    });
    toast({
      title: `Imported ${imported} supplements!`,
      description: 'Redirecting to Stack Builder...',
    });
    navigate('/stack-builder');
  };

  const { data: stack, isLoading, error } = useQuery({
    queryKey: ['shared-stack', shareToken],
    queryFn: async () => {
      if (!shareToken) throw new Error('No share token provided');

      const { data, error } = await supabase
        .from('saved_stacks')
        .select(`
          *,
          items:saved_stack_items(
            *,
            supplement:supplements(*)
          )
        `)
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Stack not found');
      
      return data;
    },
    enabled: !!shareToken,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Layout>
    );
  }

  if (error || !stack) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Stack Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This stack may have been removed or the link is invalid.
              </p>
              <Button asChild>
                <Link to="/">
                  Browse Supplements
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const DAYS_SHORT: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <User className="h-4 w-4" />
            <span className="text-sm">Shared Stack</span>
          </div>
          <h1 className="text-3xl font-serif font-bold">{stack.name}</h1>
          <p className="text-muted-foreground">
            {stack.items?.length || 0} supplements in this stack
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Supplements
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>All supplements included in this stack</span>
              <Button size="sm" onClick={handleImport}>
                <Download className="h-4 w-4 mr-1" />
                Import All to My Stack
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stack.items?.map((item: any) => (
              <div 
                key={item.id}
                className="p-4 rounded-lg bg-muted/30 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link 
                      to={`/supplement/${item.supplement?.id}`}
                      className="font-medium text-lg hover:text-primary transition-colors"
                    >
                      {item.supplement?.name}
                    </Link>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">
                        {CATEGORY_LABELS[item.supplement?.category as keyof typeof CATEGORY_LABELS]}
                      </Badge>
                      {item.supplement?.optimal_timing?.slice(0, 2).map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {TIMING_LABELS[t as keyof typeof TIMING_LABELS]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {item.days_of_week?.map((d: string) => DAYS_SHORT[d]).join(', ') || 'Every day'}
                    </span>
                  </div>
                  {item.reminder_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{item.reminder_time}</span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                    {item.notes}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6 text-center">
            <h3 className="text-lg font-medium mb-2">Want to create your own stack?</h3>
            <p className="text-muted-foreground mb-4">
              Browse our supplement database and build a personalized regimen.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link to="/stack-builder">
                  Start Building
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">
                  Browse Supplements
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
