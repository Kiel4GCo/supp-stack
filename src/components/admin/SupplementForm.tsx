import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Plus } from 'lucide-react';
import type { Supplement, SupplementCategory, SupplementTiming, EvidenceLevel, DietaryPreference } from '@/types/supplement';
import { CATEGORY_LABELS, TIMING_LABELS, EVIDENCE_LABELS } from '@/types/supplement';

interface SupplementFormProps {
  supplement?: Supplement | null;
  onSubmit: (data: Partial<Supplement>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const DIETARY_PREFERENCES: DietaryPreference[] = [
  'vegan', 'vegetarian', 'gluten_free', 'non_gmo', 'organic', 'kosher', 'halal'
];

const TIMING_OPTIONS: SupplementTiming[] = [
  'morning', 'afternoon', 'evening', 'with_food', 'empty_stomach', 'before_bed', 'any_time'
];

const CATEGORY_OPTIONS: SupplementCategory[] = [
  'vitamins', 'minerals', 'amino_acids', 'herbs', 'probiotics', 
  'omega_fatty_acids', 'antioxidants', 'adaptogens', 'enzymes', 'other'
];

const EVIDENCE_OPTIONS: EvidenceLevel[] = ['strong', 'emerging', 'limited'];

export function SupplementForm({ supplement, onSubmit, onCancel, isLoading }: SupplementFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SupplementCategory>('vitamins');
  const [dosageInfo, setDosageInfo] = useState('');
  const [evidenceLevel, setEvidenceLevel] = useState<EvidenceLevel>('emerging');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [contraindications, setContraindications] = useState<string[]>([]);
  const [optimalTiming, setOptimalTiming] = useState<SupplementTiming[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  
  const [newBenefit, setNewBenefit] = useState('');
  const [newSideEffect, setNewSideEffect] = useState('');
  const [newContraindication, setNewContraindication] = useState('');

  useEffect(() => {
    if (supplement) {
      setName(supplement.name);
      setDescription(supplement.description);
      setCategory(supplement.category);
      setDosageInfo(supplement.dosage_info);
      setEvidenceLevel(supplement.evidence_level);
      setBenefits(supplement.benefits || []);
      setSideEffects(supplement.side_effects || []);
      setContraindications(supplement.contraindications || []);
      setOptimalTiming(supplement.optimal_timing || []);
      setDietaryPreferences(supplement.dietary_preferences || []);
    }
  }, [supplement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      description,
      category,
      dosage_info: dosageInfo,
      evidence_level: evidenceLevel,
      benefits,
      side_effects: sideEffects,
      contraindications,
      optimal_timing: optimalTiming,
      dietary_preferences: dietaryPreferences,
    });
  };

  const addItem = (list: string[], setList: (items: string[]) => void, item: string, setItem: (val: string) => void) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
      setItem('');
    }
  };

  const removeItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    setList(list.filter(i => i !== item));
  };

  const toggleTiming = (timing: SupplementTiming) => {
    setOptimalTiming(prev => 
      prev.includes(timing) 
        ? prev.filter(t => t !== timing)
        : [...prev, timing]
    );
  };

  const toggleDietaryPreference = (pref: DietaryPreference) => {
    setDietaryPreferences(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vitamin D3"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as SupplementCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the supplement..."
              rows={3}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage Information *</Label>
              <Textarea
                id="dosage"
                value={dosageInfo}
                onChange={(e) => setDosageInfo(e.target.value)}
                placeholder="1000-5000 IU daily..."
                rows={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evidence">Evidence Level *</Label>
              <Select value={evidenceLevel} onValueChange={(v) => setEvidenceLevel(v as EvidenceLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVIDENCE_OPTIONS.map(level => (
                    <SelectItem key={level} value={level}>
                      {EVIDENCE_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benefits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              placeholder="Add a benefit..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem(benefits, setBenefits, newBenefit, setNewBenefit);
                }
              }}
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={() => addItem(benefits, setBenefits, newBenefit, setNewBenefit)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit) => (
              <Badge key={benefit} variant="secondary" className="gap-1">
                {benefit}
                <button
                  type="button"
                  onClick={() => removeItem(benefits, setBenefits, benefit)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimal Timing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TIMING_OPTIONS.map((timing) => (
              <div key={timing} className="flex items-center space-x-2">
                <Checkbox
                  id={`timing-${timing}`}
                  checked={optimalTiming.includes(timing)}
                  onCheckedChange={() => toggleTiming(timing)}
                />
                <Label htmlFor={`timing-${timing}`} className="text-sm">
                  {TIMING_LABELS[timing]}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Side Effects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSideEffect}
              onChange={(e) => setNewSideEffect(e.target.value)}
              placeholder="Add a side effect..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem(sideEffects, setSideEffects, newSideEffect, setNewSideEffect);
                }
              }}
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={() => addItem(sideEffects, setSideEffects, newSideEffect, setNewSideEffect)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sideEffects.map((effect) => (
              <Badge key={effect} variant="outline" className="gap-1">
                {effect}
                <button
                  type="button"
                  onClick={() => removeItem(sideEffects, setSideEffects, effect)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contraindications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newContraindication}
              onChange={(e) => setNewContraindication(e.target.value)}
              placeholder="Add a contraindication..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem(contraindications, setContraindications, newContraindication, setNewContraindication);
                }
              }}
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={() => addItem(contraindications, setContraindications, newContraindication, setNewContraindication)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {contraindications.map((item) => (
              <Badge key={item} variant="outline" className="gap-1 text-destructive border-destructive/30">
                {item}
                <button
                  type="button"
                  onClick={() => removeItem(contraindications, setContraindications, item)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dietary Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {DIETARY_PREFERENCES.map((pref) => (
              <div key={pref} className="flex items-center space-x-2">
                <Checkbox
                  id={`pref-${pref}`}
                  checked={dietaryPreferences.includes(pref)}
                  onCheckedChange={() => toggleDietaryPreference(pref)}
                />
                <Label htmlFor={`pref-${pref}`} className="text-sm capitalize">
                  {pref.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {supplement ? 'Update Supplement' : 'Create Supplement'}
        </Button>
      </div>
    </form>
  );
}
