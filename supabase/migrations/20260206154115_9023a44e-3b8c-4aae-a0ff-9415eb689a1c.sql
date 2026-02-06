
CREATE TABLE public.email_reminder_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  email text NOT NULL,
  reminder_time time NOT NULL DEFAULT '08:00',
  days_of_week text[] NOT NULL DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_reminder_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.email_reminder_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.email_reminder_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.email_reminder_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON public.email_reminder_preferences FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.email_reminder_preferences ADD CONSTRAINT unique_user_email_pref UNIQUE (user_id);

CREATE TRIGGER update_email_reminder_preferences_updated_at
  BEFORE UPDATE ON public.email_reminder_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
