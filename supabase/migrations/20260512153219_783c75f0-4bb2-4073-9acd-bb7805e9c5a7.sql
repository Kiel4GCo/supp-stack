
CREATE TABLE public.supplement_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplement_id UUID,
  supplement_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  changed_by_email TEXT,
  source_text TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_supplement_audit_log_supplement_id ON public.supplement_audit_log(supplement_id);
CREATE INDEX idx_supplement_audit_log_created_at ON public.supplement_audit_log(created_at DESC);

ALTER TABLE public.supplement_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view supplement audit log"
ON public.supplement_audit_log
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = (auth.jwt() ->> 'email')));

CREATE POLICY "Admins can insert supplement audit log"
ON public.supplement_audit_log
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.email = (auth.jwt() ->> 'email')));

CREATE OR REPLACE FUNCTION public.log_supplement_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_email TEXT;
BEGIN
  BEGIN
    actor_email := (auth.jwt() ->> 'email');
  EXCEPTION WHEN OTHERS THEN
    actor_email := NULL;
  END;

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.supplement_audit_log (supplement_id, supplement_name, operation, changed_by_email, new_data)
    VALUES (NEW.id, NEW.name, 'insert', actor_email, to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.supplement_audit_log (supplement_id, supplement_name, operation, changed_by_email, old_data, new_data)
    VALUES (NEW.id, NEW.name, 'update', actor_email, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.supplement_audit_log (supplement_id, supplement_name, operation, changed_by_email, old_data)
    VALUES (OLD.id, OLD.name, 'delete', actor_email, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER supplements_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.supplements
FOR EACH ROW EXECUTE FUNCTION public.log_supplement_changes();
