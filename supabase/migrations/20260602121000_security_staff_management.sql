-- Security personnel metadata for estate-managed security accounts.
CREATE TABLE IF NOT EXISTS public.security_staff (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  estate_id uuid REFERENCES public.estates(id) ON DELETE CASCADE,
  employee_id text NOT NULL,
  shift text NOT NULL DEFAULT 'day' CHECK (shift IN ('day', 'night', 'rotational')),
  is_active boolean NOT NULL DEFAULT true,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (estate_id, employee_id)
);

ALTER TABLE public.security_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Estate admins can manage own estate security staff" ON public.security_staff;
CREATE POLICY "Estate admins can manage own estate security staff"
ON public.security_staff FOR ALL TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND estate_id = public.get_user_estate_id(auth.uid())
  )
)
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND estate_id = public.get_user_estate_id(auth.uid())
  )
);

DROP POLICY IF EXISTS "Security staff can view own staff record" ON public.security_staff;
CREATE POLICY "Security staff can view own staff record"
ON public.security_staff FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Estate admins can update own estate profiles" ON public.profiles;
CREATE POLICY "Estate admins can update own estate profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND estate_id = public.get_user_estate_id(auth.uid())
  )
)
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND estate_id = public.get_user_estate_id(auth.uid())
  )
);

DROP TRIGGER IF EXISTS security_staff_updated_at ON public.security_staff;
CREATE TRIGGER security_staff_updated_at
  BEFORE UPDATE ON public.security_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
