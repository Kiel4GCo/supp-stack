import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { useSupplement } from '@/hooks/useSupplements';
import { useSupplementInteractions } from '@/hooks/useInteractions';
import { useStack } from '@/hooks/useStack';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  Clock, 
  AlertTriangle, 
  Sparkles,
  Shield,
  Zap,
  AlertCircle,
  Pill
} from 'lucide-react';
import { 
  CATEGORY_LABELS, 
  TIMING_LABELS, 
  EVIDENCE_LABELS 
} from '@/types/supplement';
import { cn } from '@/lib/utils';

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

const SupplementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: supplement, isLoading, error } = useSupplement(id);
  const { data: interactions } = useSupplementInteractions(id);
  const { stack, addToStack, removeFromStack } = useStack();

  const isInStack = stack.some(item => item.supplement.id === id);

  const synergies = interactions?.filter(i => i.interaction_type === 'synergy') || [];
  const conflicts = interactions?.filter(i => i.interaction_type === 'conflict') || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-40" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !supplement) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load supplement details.</p>
          <Button asChild className="mt-4">
            <Link to="/">Back to Supplements</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{`${supplement.name} — Benefits, Dosage & Timing | SupplementInfo`}</title>
        <meta name="description" content={supplement.description?.slice(0, 160)} />
        <link rel="canonical" href={`/supplement/${supplement.id}`} />
        <meta property="og:title" content={`${supplement.name} — SupplementInfo`} />
        <meta property="og:description" content={supplement.description?.slice(0, 160)} />
        <meta property="og:url" content={`/supplement/${supplement.id}`} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalEntity",
          "name": supplement.name,
          "description": supplement.description,
        })}</script>
      </Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Supplements
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif font-bold">{supplement.name}</h1>
              <Badge 
                variant="outline" 
                className={cn('text-sm', CATEGORY_COLORS[supplement.category])}
              >
                {CATEGORY_LABELS[supplement.category]}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{supplement.description}</p>
          </div>
          <Button
            size="lg"
            variant={isInStack ? 'default' : 'outline'}
            onClick={() => isInStack ? removeFromStack(supplement.id) : addToStack(supplement)}
          >
            {isInStack ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                In Stack
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Stack
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {supplement.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Dosage & Timing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-chart-2" />
                  Dosage & Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Recommended Dosage</h4>
                  <p className="text-muted-foreground">{supplement.dosage_info}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Optimal Timing</h4>
                  <div className="flex flex-wrap gap-2">
                    {supplement.optimal_timing.map((timing) => (
                      <Badge key={timing} variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {TIMING_LABELS[timing]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Side Effects & Contraindications */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="h-5 w-5 text-chart-5" />
                    Side Effects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {supplement.side_effects && supplement.side_effects.length > 0 ? (
                    <ul className="space-y-1.5 text-sm">
                      {supplement.side_effects.map((effect) => (
                        <li key={effect} className="text-muted-foreground">
                          • {effect}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No common side effects reported.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-5 w-5 text-destructive" />
                    Contraindications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {supplement.contraindications && supplement.contraindications.length > 0 ? (
                    <ul className="space-y-1.5 text-sm">
                      {supplement.contraindications.map((item) => (
                        <li key={item} className="text-muted-foreground">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Consult your healthcare provider before use.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Evidence Level */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evidence Level</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge 
                  className={cn('text-sm', EVIDENCE_COLORS[supplement.evidence_level])}
                >
                  {EVIDENCE_LABELS[supplement.evidence_level]}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {supplement.evidence_level === 'strong' && 
                    'Supported by multiple clinical trials and meta-analyses.'}
                  {supplement.evidence_level === 'emerging' && 
                    'Promising research with some clinical evidence.'}
                  {supplement.evidence_level === 'limited' && 
                    'Limited clinical evidence; more research needed.'}
                </p>
              </CardContent>
            </Card>

            {/* Synergies */}
            {synergies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-5 w-5 text-chart-1" />
                    Works Well With
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {synergies.map((interaction) => (
                    <Link 
                      key={interaction.id} 
                      to={`/supplement/${interaction.related_supplement.id}`}
                      className="block p-3 rounded-lg bg-chart-1/5 hover:bg-chart-1/10 transition-colors"
                    >
                      <div className="font-medium text-sm">
                        {interaction.related_supplement.name}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {interaction.description}
                      </p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Conflicts */}
            {conflicts.length > 0 && (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Interactions to Watch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conflicts.map((interaction) => (
                    <Link 
                      key={interaction.id} 
                      to={`/supplement/${interaction.related_supplement.id}`}
                      className="block p-3 rounded-lg bg-destructive/5 hover:bg-destructive/10 transition-colors"
                    >
                      <div className="font-medium text-sm">
                        {interaction.related_supplement.name}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {interaction.description}
                      </p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Dietary Preferences */}
            {supplement.dietary_preferences && supplement.dietary_preferences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dietary Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {supplement.dietary_preferences.map((pref) => (
                      <Badge key={pref} variant="outline" className="text-xs">
                        {pref.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="bg-muted/30 border-muted">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Disclaimer:</strong> This information is for educational purposes only and is not 
              intended as medical advice. Always consult with a healthcare provider before starting any 
              new supplement regimen.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SupplementDetail;
