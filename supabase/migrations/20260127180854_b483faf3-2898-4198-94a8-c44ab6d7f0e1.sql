-- Add cost tracking columns to supplements table
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS cost_per_unit DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS units_per_container INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS servings_per_day INTEGER DEFAULT 1;

-- Create table for adherence tracking (which days users actually took their supplements)
CREATE TABLE public.adherence_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stack_item_id UUID REFERENCES public.saved_stack_items(id) ON DELETE CASCADE,
  supplement_id UUID REFERENCES public.supplements(id) ON DELETE CASCADE NOT NULL,
  logged_date DATE NOT NULL,
  taken BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate logs for same supplement on same day
CREATE UNIQUE INDEX adherence_logs_unique_per_day ON public.adherence_logs (user_id, supplement_id, logged_date);

-- Add sharing columns to saved_stacks
ALTER TABLE public.saved_stacks
ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create index on share_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_saved_stacks_share_token ON public.saved_stacks(share_token) WHERE share_token IS NOT NULL;

-- Enable RLS on adherence_logs
ALTER TABLE public.adherence_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for adherence_logs
CREATE POLICY "Users can view their own adherence logs"
ON public.adherence_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own adherence logs"
ON public.adherence_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adherence logs"
ON public.adherence_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own adherence logs"
ON public.adherence_logs FOR DELETE
USING (auth.uid() = user_id);

-- Add policy for public stack viewing via share token
CREATE POLICY "Anyone can view public stacks by share token"
ON public.saved_stacks FOR SELECT
USING (is_public = true AND share_token IS NOT NULL);

-- Add policy for viewing items of public stacks
CREATE POLICY "Anyone can view items of public stacks"
ON public.saved_stack_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.saved_stacks 
    WHERE saved_stacks.id = saved_stack_items.stack_id 
    AND saved_stacks.is_public = true 
    AND saved_stacks.share_token IS NOT NULL
  )
);