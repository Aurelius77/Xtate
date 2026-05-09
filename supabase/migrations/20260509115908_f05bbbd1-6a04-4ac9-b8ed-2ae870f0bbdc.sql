
-- 1. Fix handle_new_user: hardcode role to 'resident', ignore client-supplied estate_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, estate_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    '00000000-0000-0000-0000-000000000001'::uuid
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'resident'::public.app_role);

  INSERT INTO public.residents (user_id, house_unit_number, estate_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'house_unit', ''),
    '00000000-0000-0000-0000-000000000001'::uuid
  );

  RETURN NEW;
END;
$function$;

-- 2. user_roles: explicit restrictive INSERT/UPDATE/DELETE policies (only admins)
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Only admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Only admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Only admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_super_admin(auth.uid()));

-- 3. resident_dues: remove resident UPDATE access
DROP POLICY IF EXISTS "Residents can update own due status" ON public.resident_dues;

-- 4. attendance: enforce time window
DROP POLICY IF EXISTS "Residents can mark own attendance" ON public.attendance;
CREATE POLICY "Residents can mark own attendance"
ON public.attendance FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.residents
    WHERE residents.id = attendance.resident_id
      AND residents.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.meetings
    WHERE meetings.id = attendance.meeting_id
      AND now() BETWEEN meetings.attendance_window_start
                    AND meetings.attendance_window_end
  )
);

-- 5. Cross-estate isolation for meetings, announcements, dues
DROP POLICY IF EXISTS "Authenticated users can view meetings" ON public.meetings;
CREATE POLICY "Users can view own estate meetings" ON public.meetings
  FOR SELECT TO authenticated
  USING (estate_id = public.get_user_estate_id(auth.uid()) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view announcements" ON public.announcements;
CREATE POLICY "Users can view own estate announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (estate_id = public.get_user_estate_id(auth.uid()) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view active dues" ON public.dues;
CREATE POLICY "Users can view own estate active dues" ON public.dues
  FOR SELECT TO authenticated
  USING (is_active = true AND (estate_id = public.get_user_estate_id(auth.uid()) OR public.is_super_admin(auth.uid())));

-- 6. Remove broad security-role access to resident PII
DROP POLICY IF EXISTS "Security can view residents" ON public.residents;

-- 7. Restrict security access on access_codes to currently valid, unused codes
DROP POLICY IF EXISTS "Security can view and update access codes" ON public.access_codes;
DROP POLICY IF EXISTS "Security can update access codes" ON public.access_codes;

CREATE POLICY "Security can view active access codes" ON public.access_codes
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'security'::app_role)
    AND is_used = false
    AND now() BETWEEN valid_from AND valid_until
  );

CREATE POLICY "Security can mark access codes used" ON public.access_codes
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'security'::app_role)
    AND is_used = false
    AND now() BETWEEN valid_from AND valid_until
  )
  WITH CHECK (public.has_role(auth.uid(), 'security'::app_role));

-- 8. Storage: documents bucket — restrict to owners, admins, or explicitly public files
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view permitted documents" ON storage.objects;

CREATE POLICY "Users can view permitted documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.is_super_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.file_url LIKE '%' || storage.objects.name || '%'
          AND (d.is_public = true OR d.uploaded_by = auth.uid())
      )
    )
  );

-- 9. Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_estate_id(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_estate_id(uuid) TO authenticated;
