
-- Blood work feature schema

CREATE TABLE public.blood_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  default_unit TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blood_markers TO anon, authenticated;
GRANT ALL ON public.blood_markers TO service_role;
ALTER TABLE public.blood_markers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blood markers are publicly readable" ON public.blood_markers FOR SELECT USING (true);
CREATE POLICY "Admins manage blood markers" ON public.blood_markers FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email')))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email')));

CREATE TABLE public.blood_marker_supplements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  marker_id UUID NOT NULL REFERENCES public.blood_markers(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES public.supplements(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('low','high')),
  priority INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(marker_id, supplement_id, direction)
);
GRANT SELECT ON public.blood_marker_supplements TO anon, authenticated;
GRANT ALL ON public.blood_marker_supplements TO service_role;
ALTER TABLE public.blood_marker_supplements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Marker supplements publicly readable" ON public.blood_marker_supplements FOR SELECT USING (true);
CREATE POLICY "Admins manage marker supplements" ON public.blood_marker_supplements FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email')))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email')));

CREATE TABLE public.blood_work_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_date DATE NOT NULL,
  lab_name TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','upload')),
  original_file_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_work_reports TO authenticated;
GRANT ALL ON public.blood_work_reports TO service_role;
ALTER TABLE public.blood_work_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own reports" ON public.blood_work_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reports" ON public.blood_work_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reports" ON public.blood_work_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reports" ON public.blood_work_reports FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.blood_work_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_id UUID NOT NULL REFERENCES public.blood_work_reports(id) ON DELETE CASCADE,
  marker_id UUID NOT NULL REFERENCES public.blood_markers(id) ON DELETE RESTRICT,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  range_low NUMERIC,
  range_high NUMERIC,
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('low','normal','high')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blood_work_results TO authenticated;
GRANT ALL ON public.blood_work_results TO service_role;
ALTER TABLE public.blood_work_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own results" ON public.blood_work_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own results" ON public.blood_work_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own results" ON public.blood_work_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own results" ON public.blood_work_results FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_bw_results_user_marker ON public.blood_work_results(user_id, marker_id);
CREATE INDEX idx_bw_reports_user_date ON public.blood_work_reports(user_id, test_date DESC);

CREATE TRIGGER update_blood_markers_updated_at BEFORE UPDATE ON public.blood_markers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bw_reports_updated_at BEFORE UPDATE ON public.blood_work_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bw_results_updated_at BEFORE UPDATE ON public.blood_work_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed common markers
INSERT INTO public.blood_markers (key, name, default_unit, category, description) VALUES
  ('vitamin_d', 'Vitamin D (25-OH)', 'ng/mL', 'vitamins', 'Reflects vitamin D stores'),
  ('vitamin_b12', 'Vitamin B12', 'pg/mL', 'vitamins', 'Essential for nerve function and red blood cells'),
  ('folate', 'Folate', 'ng/mL', 'vitamins', 'Vitamin B9'),
  ('ferritin', 'Ferritin', 'ng/mL', 'minerals', 'Iron storage marker'),
  ('iron', 'Iron (Serum)', 'µg/dL', 'minerals', 'Serum iron level'),
  ('magnesium', 'Magnesium', 'mg/dL', 'minerals', 'Essential mineral'),
  ('zinc', 'Zinc', 'µg/dL', 'minerals', 'Essential mineral'),
  ('calcium', 'Calcium', 'mg/dL', 'minerals', 'Serum calcium'),
  ('tsh', 'TSH', 'mIU/L', 'hormones', 'Thyroid stimulating hormone'),
  ('hemoglobin', 'Hemoglobin', 'g/dL', 'cbc', 'Oxygen-carrying protein'),
  ('hba1c', 'HbA1c', '%', 'metabolic', '3-month glucose average'),
  ('hdl', 'HDL Cholesterol', 'mg/dL', 'lipids', 'Good cholesterol'),
  ('ldl', 'LDL Cholesterol', 'mg/dL', 'lipids', 'Bad cholesterol'),
  ('triglycerides', 'Triglycerides', 'mg/dL', 'lipids', 'Blood fats'),
  ('omega_3_index', 'Omega-3 Index', '%', 'lipids', 'EPA+DHA in RBC membranes');
