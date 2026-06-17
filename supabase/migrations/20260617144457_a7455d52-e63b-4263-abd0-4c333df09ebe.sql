
-- 1. Add user_id column to admin_users and backfill from auth.users
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE public.admin_users a
SET user_id = u.id
FROM auth.users u
WHERE lower(u.email) = lower(a.email) AND a.user_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_key
  ON public.admin_users(user_id) WHERE user_id IS NOT NULL;

-- 2. Security definer helper to check admin status by user id (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = _user_id
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon, service_role;

-- 3. Replace all email-based admin policies with user-id-based checks

-- admin_users: users can only see their own admin record by user_id
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;
CREATE POLICY "Admin users can view their own record"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- supplements
DROP POLICY IF EXISTS "Admins can delete supplements" ON public.supplements;
DROP POLICY IF EXISTS "Admins can insert supplements" ON public.supplements;
DROP POLICY IF EXISTS "Admins can update supplements" ON public.supplements;
CREATE POLICY "Admins can delete supplements" ON public.supplements FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert supplements" ON public.supplements FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update supplements" ON public.supplements FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- blood_markers
DROP POLICY IF EXISTS "Admins manage blood markers" ON public.blood_markers;
CREATE POLICY "Admins manage blood markers" ON public.blood_markers FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- blood_marker_supplements
DROP POLICY IF EXISTS "Admins manage marker supplements" ON public.blood_marker_supplements;
CREATE POLICY "Admins manage marker supplements" ON public.blood_marker_supplements FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- supplement_interactions
DROP POLICY IF EXISTS "Admins can delete supplement interactions" ON public.supplement_interactions;
DROP POLICY IF EXISTS "Admins can insert supplement interactions" ON public.supplement_interactions;
DROP POLICY IF EXISTS "Admins can update supplement interactions" ON public.supplement_interactions;
CREATE POLICY "Admins can delete supplement interactions" ON public.supplement_interactions FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert supplement interactions" ON public.supplement_interactions FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update supplement interactions" ON public.supplement_interactions FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- deficiencies
DROP POLICY IF EXISTS "Admins can delete deficiencies" ON public.deficiencies;
DROP POLICY IF EXISTS "Admins can insert deficiencies" ON public.deficiencies;
DROP POLICY IF EXISTS "Admins can update deficiencies" ON public.deficiencies;
CREATE POLICY "Admins can delete deficiencies" ON public.deficiencies FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert deficiencies" ON public.deficiencies FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update deficiencies" ON public.deficiencies FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- deficiency_supplements
DROP POLICY IF EXISTS "Admins can delete deficiency supplements" ON public.deficiency_supplements;
DROP POLICY IF EXISTS "Admins can insert deficiency supplements" ON public.deficiency_supplements;
DROP POLICY IF EXISTS "Admins can update deficiency supplements" ON public.deficiency_supplements;
CREATE POLICY "Admins can delete deficiency supplements" ON public.deficiency_supplements FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert deficiency supplements" ON public.deficiency_supplements FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update deficiency supplements" ON public.deficiency_supplements FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- supplement_audit_log: switch to is_admin, and add admin UPDATE/DELETE for cleanup
DROP POLICY IF EXISTS "Admins can insert supplement audit log" ON public.supplement_audit_log;
DROP POLICY IF EXISTS "Admins can view supplement audit log" ON public.supplement_audit_log;
CREATE POLICY "Admins can view supplement audit log" ON public.supplement_audit_log FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert supplement audit log" ON public.supplement_audit_log FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update supplement audit log" ON public.supplement_audit_log FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete supplement audit log" ON public.supplement_audit_log FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
