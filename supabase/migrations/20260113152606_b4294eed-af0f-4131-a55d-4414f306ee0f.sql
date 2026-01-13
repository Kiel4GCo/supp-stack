-- Create categories enum
CREATE TYPE supplement_category AS ENUM (
  'vitamins',
  'minerals',
  'amino_acids',
  'herbs',
  'probiotics',
  'omega_fatty_acids',
  'antioxidants',
  'adaptogens',
  'enzymes',
  'other'
);

-- Create timing enum
CREATE TYPE supplement_timing AS ENUM (
  'morning',
  'afternoon',
  'evening',
  'with_food',
  'empty_stomach',
  'before_bed',
  'any_time'
);

-- Create evidence level enum
CREATE TYPE evidence_level AS ENUM (
  'strong',
  'emerging',
  'limited'
);

-- Create dietary preference enum
CREATE TYPE dietary_preference AS ENUM (
  'vegan',
  'vegetarian',
  'gluten_free',
  'non_gmo',
  'organic',
  'kosher',
  'halal'
);

-- Create supplements table
CREATE TABLE public.supplements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category supplement_category NOT NULL,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  dosage_info TEXT NOT NULL,
  optimal_timing supplement_timing[] NOT NULL DEFAULT '{}',
  side_effects TEXT[] DEFAULT '{}',
  contraindications TEXT[] DEFAULT '{}',
  evidence_level evidence_level NOT NULL DEFAULT 'emerging',
  dietary_preferences dietary_preference[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplement interactions table (for synergies and conflicts)
CREATE TABLE public.supplement_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplement_id UUID NOT NULL REFERENCES public.supplements(id) ON DELETE CASCADE,
  related_supplement_id UUID NOT NULL REFERENCES public.supplements(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('synergy', 'conflict')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(supplement_id, related_supplement_id)
);

-- Create deficiencies table
CREATE TABLE public.deficiencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  dietary_sources TEXT[] DEFAULT '{}',
  expected_timeframe TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deficiency_supplements junction table
CREATE TABLE public.deficiency_supplements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deficiency_id UUID NOT NULL REFERENCES public.deficiencies(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES public.supplements(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  UNIQUE(deficiency_id, supplement_id)
);

-- Enable Row Level Security (public read, admin write)
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deficiency_supplements ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Supplements are publicly readable" 
ON public.supplements FOR SELECT USING (true);

CREATE POLICY "Supplement interactions are publicly readable" 
ON public.supplement_interactions FOR SELECT USING (true);

CREATE POLICY "Deficiencies are publicly readable" 
ON public.deficiencies FOR SELECT USING (true);

CREATE POLICY "Deficiency supplements are publicly readable" 
ON public.deficiency_supplements FOR SELECT USING (true);

-- Create admin_users table for admin panel access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view their own record"
ON public.admin_users FOR SELECT
USING (auth.jwt() ->> 'email' = email);

-- Admin write policies for supplements
CREATE POLICY "Admins can insert supplements"
ON public.supplements FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Admins can update supplements"
ON public.supplements FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Admins can delete supplements"
ON public.supplements FOR DELETE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

-- Admin write policies for supplement_interactions
CREATE POLICY "Admins can insert supplement interactions"
ON public.supplement_interactions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Admins can update supplement interactions"
ON public.supplement_interactions FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Admins can delete supplement interactions"
ON public.supplement_interactions FOR DELETE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

-- Admin write policies for deficiencies
CREATE POLICY "Admins can insert deficiencies"
ON public.deficiencies FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Admins can update deficiencies"
ON public.deficiencies FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Admins can delete deficiencies"
ON public.deficiencies FOR DELETE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

-- Admin write policies for deficiency_supplements
CREATE POLICY "Admins can insert deficiency supplements"
ON public.deficiency_supplements FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Admins can update deficiency supplements"
ON public.deficiency_supplements FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Admins can delete deficiency supplements"
ON public.deficiency_supplements FOR DELETE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_supplements_updated_at
BEFORE UPDATE ON public.supplements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deficiencies_updated_at
BEFORE UPDATE ON public.deficiencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();