-- Create saved_stacks table for users to save their supplement stacks
CREATE TABLE public.saved_stacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_stack_items table for individual supplements in a stack
CREATE TABLE public.saved_stack_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stack_id UUID NOT NULL REFERENCES public.saved_stacks(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES public.supplements(id) ON DELETE CASCADE,
  days_of_week TEXT[] NOT NULL DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  reminder_time TIME NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_stack_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_stacks
CREATE POLICY "Users can view their own stacks" 
ON public.saved_stacks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stacks" 
ON public.saved_stacks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stacks" 
ON public.saved_stacks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stacks" 
ON public.saved_stacks 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for saved_stack_items (through stack ownership)
CREATE POLICY "Users can view items in their stacks" 
ON public.saved_stack_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.saved_stacks 
    WHERE saved_stacks.id = saved_stack_items.stack_id 
    AND saved_stacks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add items to their stacks" 
ON public.saved_stack_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.saved_stacks 
    WHERE saved_stacks.id = saved_stack_items.stack_id 
    AND saved_stacks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items in their stacks" 
ON public.saved_stack_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.saved_stacks 
    WHERE saved_stacks.id = saved_stack_items.stack_id 
    AND saved_stacks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete items from their stacks" 
ON public.saved_stack_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.saved_stacks 
    WHERE saved_stacks.id = saved_stack_items.stack_id 
    AND saved_stacks.user_id = auth.uid()
  )
);

-- Add trigger for updated_at on saved_stacks
CREATE TRIGGER update_saved_stacks_updated_at
BEFORE UPDATE ON public.saved_stacks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_saved_stacks_user_id ON public.saved_stacks(user_id);
CREATE INDEX idx_saved_stack_items_stack_id ON public.saved_stack_items(stack_id);
CREATE INDEX idx_saved_stack_items_supplement_id ON public.saved_stack_items(supplement_id);