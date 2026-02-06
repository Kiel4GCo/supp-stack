export type SupplementCategory = 
  | 'vitamins'
  | 'minerals'
  | 'amino_acids'
  | 'herbs'
  | 'probiotics'
  | 'omega_fatty_acids'
  | 'antioxidants'
  | 'adaptogens'
  | 'enzymes'
  | 'other';

export type SupplementTiming = 
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'with_food'
  | 'empty_stomach'
  | 'before_bed'
  | 'any_time';

export type EvidenceLevel = 'strong' | 'emerging' | 'limited';

export type DietaryPreference = 
  | 'vegan'
  | 'vegetarian'
  | 'gluten_free'
  | 'non_gmo'
  | 'organic'
  | 'kosher'
  | 'halal';

export interface Supplement {
  id: string;
  name: string;
  description: string;
  category: SupplementCategory;
  benefits: string[];
  dosage_info: string;
  optimal_timing: SupplementTiming[];
  side_effects: string[];
  contraindications: string[];
  evidence_level: EvidenceLevel;
  dietary_preferences: DietaryPreference[];
  image_url: string | null;
  cost_per_unit: number | null;
  units_per_container: number | null;
  servings_per_day: number | null;
  created_at: string;
  updated_at: string;
}

export interface SupplementInteraction {
  id: string;
  supplement_id: string;
  related_supplement_id: string;
  interaction_type: 'synergy' | 'conflict';
  description: string;
  created_at: string;
}

export interface Deficiency {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  dietary_sources: string[];
  expected_timeframe: string | null;
  created_at: string;
  updated_at: string;
}

export interface StackItem {
  supplement: Supplement;
  addedAt: Date;
}

export const CATEGORY_LABELS: Record<SupplementCategory, string> = {
  vitamins: 'Vitamins',
  minerals: 'Minerals',
  amino_acids: 'Amino Acids',
  herbs: 'Herbs',
  probiotics: 'Probiotics',
  omega_fatty_acids: 'Omega Fatty Acids',
  antioxidants: 'Antioxidants',
  adaptogens: 'Adaptogens',
  enzymes: 'Enzymes',
  other: 'Other',
};

export const TIMING_LABELS: Record<SupplementTiming, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  with_food: 'With Food',
  empty_stomach: 'Empty Stomach',
  before_bed: 'Before Bed',
  any_time: 'Any Time',
};

export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  strong: 'Strong Evidence',
  emerging: 'Emerging Evidence',
  limited: 'Limited Evidence',
};
