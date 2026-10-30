CREATE TABLE public.ci_ai_access_state (id text PRIMARY KEY, status integer NOT NULL, message text NOT NULL, requires text, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ci_ai_access_state TO service_role;
ALTER TABLE public.ci_ai_access_state ENABLE ROW LEVEL SECURITY;