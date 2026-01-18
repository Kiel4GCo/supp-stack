import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAllSymptoms, useDeficienciesBySymptoms } from '@/hooks/useDeficiencies';
import { useStack } from '@/hooks/useStack';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  AlertTriangle, 
  Pill, 
  Clock, 
  Plus, 
  Check,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DeficiencyAdvisor = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const { data: allSymptoms, isLoading: symptomsLoading } = useAllSymptoms();
  const { data: matchedDeficiencies, isLoading: deficienciesLoading } = useDeficienciesBySymptoms(selectedSymptoms);
  const { stack, addToStack, removeFromStack } = useStack();

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const clearSymptoms = () => {
    setSelectedSymptoms([]);
  };

  const isInStack = (supplementId: string) => 
    stack.some(item => item.supplement.id === supplementId);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Deficiency Advisor</h1>
          <p className="text-muted-foreground">
            Select symptoms to identify potential deficiencies and get supplement recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Symptom Selector */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Select Symptoms
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Choose all symptoms that apply
                  </CardDescription>
                </div>
                {selectedSymptoms.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearSymptoms}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {symptomsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {allSymptoms?.map((symptom) => (
                    <div 
                      key={symptom} 
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer",
                        selectedSymptoms.includes(symptom) 
                          ? "bg-primary/10" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => toggleSymptom(symptom)}
                    >
                      <Checkbox 
                        id={symptom}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={() => toggleSymptom(symptom)}
                      />
                      <Label 
                        htmlFor={symptom} 
                        className="text-sm cursor-pointer flex-1"
                      >
                        {symptom}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedSymptoms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {selectedSymptoms.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Select symptoms to get started</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Choose one or more symptoms from the list to identify potential deficiencies 
                    and get personalized supplement recommendations.
                  </p>
                </CardContent>
              </Card>
            ) : deficienciesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : matchedDeficiencies && matchedDeficiencies.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Potential Deficiencies ({matchedDeficiencies.length})
                  </h2>
                </div>

                {matchedDeficiencies.map((deficiency) => (
                  <Card key={deficiency.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{deficiency.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {deficiency.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {deficiency.matchCount} matching symptom{deficiency.matchCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {/* Matched Symptoms */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Check className="h-4 w-4 text-chart-1" />
                          Matched Symptoms
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {deficiency.matchedSymptoms.map((symptom) => (
                            <Badge key={symptom} variant="default" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Expected Timeframe */}
                      {deficiency.expected_timeframe && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{deficiency.expected_timeframe}</span>
                        </div>
                      )}

                      {/* Recommended Supplements */}
                      {deficiency.recommended_supplements.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Pill className="h-4 w-4 text-primary" />
                            Recommended Supplements
                          </h4>
                          <div className="space-y-2">
                            {deficiency.recommended_supplements.map((rec) => {
                              const inStack = isInStack(rec.supplement.id);
                              return (
                                <div 
                                  key={rec.supplement.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium",
                                      rec.priority === 1 
                                        ? "bg-primary text-primary-foreground" 
                                        : "bg-muted text-muted-foreground"
                                    )}>
                                      {rec.priority}
                                    </div>
                                    <div>
                                      <Link 
                                        to={`/supplement/${rec.supplement.id}`}
                                        className="font-medium hover:text-primary transition-colors"
                                      >
                                        {rec.supplement.name}
                                      </Link>
                                      {rec.notes && (
                                        <p className="text-xs text-muted-foreground">{rec.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant={inStack ? 'default' : 'outline'}
                                    onClick={() => inStack 
                                      ? removeFromStack(rec.supplement.id)
                                      : addToStack(rec.supplement)
                                    }
                                  >
                                    {inStack ? (
                                      <>
                                        <Check className="h-3.5 w-3.5 mr-1" />
                                        Added
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                        Add
                                      </>
                                    )}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Dietary Sources */}
                      {deficiency.dietary_sources && deficiency.dietary_sources.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-chart-2" />
                            Food Sources
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {deficiency.dietary_sources.join(', ')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* View Stack CTA */}
                {stack.length > 0 && (
                  <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                    <CardContent className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Ready to optimize your stack?</p>
                        <p className="text-sm text-muted-foreground">
                          {stack.length} supplement{stack.length !== 1 ? 's' : ''} in your stack
                        </p>
                      </div>
                      <Button asChild>
                        <Link to="/stack-builder">
                          View Stack
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No matches found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find any deficiencies matching your selected symptoms. 
                    Try selecting different symptoms or consult with a healthcare provider.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer */}
            <Card className="bg-muted/30 border-muted">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Important:</strong> This tool is for educational purposes only and does not 
                  constitute medical advice. Always consult with a qualified healthcare provider for 
                  proper diagnosis and treatment of any health concerns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeficiencyAdvisor;
