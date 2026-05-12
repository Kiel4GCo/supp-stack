
CREATE OR REPLACE FUNCTION public.log_supplement_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_email TEXT;
  src_text TEXT;
BEGIN
  BEGIN
    actor_email := (auth.jwt() ->> 'email');
  EXCEPTION WHEN OTHERS THEN
    actor_email := NULL;
  END;

  BEGIN
    src_text := current_setting('app.source_text', true);
  EXCEPTION WHEN OTHERS THEN
    src_text := NULL;
  END;

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.supplement_audit_log (supplement_id, supplement_name, operation, changed_by_email, source_text, new_data)
    VALUES (NEW.id, NEW.name, 'insert', actor_email, src_text, to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.supplement_audit_log (supplement_id, supplement_name, operation, changed_by_email, source_text, old_data, new_data)
    VALUES (NEW.id, NEW.name, 'update', actor_email, src_text, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.supplement_audit_log (supplement_id, supplement_name, operation, changed_by_email, source_text, old_data)
    VALUES (OLD.id, OLD.name, 'delete', actor_email, src_text, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_supplement_changes() FROM PUBLIC, anon, authenticated;
