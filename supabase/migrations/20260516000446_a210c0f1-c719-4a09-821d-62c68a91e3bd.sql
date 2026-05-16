
-- Recreate audit log policies restricted to the authenticated role only
DROP POLICY IF EXISTS "Admins can view supplement audit log" ON public.supplement_audit_log;
DROP POLICY IF EXISTS "Admins can insert supplement audit log" ON public.supplement_audit_log;

CREATE POLICY "Admins can view supplement audit log"
ON public.supplement_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.email = (auth.jwt() ->> 'email')
  )
);

CREATE POLICY "Admins can insert supplement audit log"
ON public.supplement_audit_log
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.email = (auth.jwt() ->> 'email')
  )
);

-- Explicitly deny anon role any access (defense in depth)
REVOKE ALL ON public.supplement_audit_log FROM anon;
REVOKE ALL ON public.supplement_audit_log FROM PUBLIC;
GRANT SELECT, INSERT ON public.supplement_audit_log TO authenticated;

-- Ensure RLS is enforced even for table owners
ALTER TABLE public.supplement_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_audit_log FORCE ROW LEVEL SECURITY;
