
CREATE OR REPLACE FUNCTION public.enforce_supplement_source_text()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  src_text TEXT;
  override_flag TEXT;
BEGIN
  BEGIN
    src_text := current_setting('app.source_text', true);
  EXCEPTION WHEN OTHERS THEN
    src_text := NULL;
  END;

  BEGIN
    override_flag := current_setting('app.source_text_override', true);
  EXCEPTION WHEN OTHERS THEN
    override_flag := NULL;
  END;

  IF (override_flag IS NOT NULL AND lower(override_flag) IN ('true','t','1','yes','on')) THEN
    RETURN NEW;
  END IF;

  IF (src_text IS NULL OR btrim(src_text) = '') THEN
    RAISE EXCEPTION 'Supplement insert rejected: app.source_text is required. Set it via SELECT set_config(''app.source_text'', ''<request text>'', true); or enable override with SELECT set_config(''app.source_text_override'', ''true'', true);'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_supplement_source_text() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_supplement_source_text_trg ON public.supplements;
CREATE TRIGGER enforce_supplement_source_text_trg
BEFORE INSERT ON public.supplements
FOR EACH ROW
EXECUTE FUNCTION public.enforce_supplement_source_text();
