-- XTATE Phase 1: RLS/security pass.
-- Tighten older estate-scoped policies so tenant/estate admins do not receive
-- platform-wide access through legacy "admin" role checks.

-- PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Estate admins can view own estate profiles" ON public.profiles;
CREATE POLICY "Estate admins can view own estate profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND estate_id = public.get_user_estate_id(auth.uid())
  )
);

-- USER ROLES
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

DROP POLICY IF EXISTS "Estate admins can insert own estate roles" ON public.user_roles;
CREATE POLICY "Estate admins can insert own estate roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_roles.user_id
        AND p.estate_id = public.get_user_estate_id(auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Estate admins can update own estate roles" ON public.user_roles;
CREATE POLICY "Estate admins can update own estate roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_roles.user_id
        AND p.estate_id = public.get_user_estate_id(auth.uid())
    )
  )
)
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_roles.user_id
        AND p.estate_id = public.get_user_estate_id(auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Estate admins can delete own estate roles" ON public.user_roles;
CREATE POLICY "Estate admins can delete own estate roles"
ON public.user_roles FOR DELETE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_roles.user_id
        AND p.estate_id = public.get_user_estate_id(auth.uid())
    )
  )
);

-- RESIDENTS
DROP POLICY IF EXISTS "Admins can manage all residents" ON public.residents;
DROP POLICY IF EXISTS "Estate admins can manage own estate residents" ON public.residents;
CREATE POLICY "Estate admins can manage own estate residents"
ON public.residents FOR ALL TO authenticated
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

DROP POLICY IF EXISTS "Residents can insert own record" ON public.residents;
CREATE POLICY "Residents can insert own estate record"
ON public.residents FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND estate_id = public.get_user_estate_id(auth.uid())
);

-- DUES
DROP POLICY IF EXISTS "Admins can manage dues" ON public.dues;
DROP POLICY IF EXISTS "Estate admins can manage own estate dues" ON public.dues;
CREATE POLICY "Estate admins can manage own estate dues"
ON public.dues FOR ALL TO authenticated
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

-- RESIDENT DUES
DROP POLICY IF EXISTS "Admins can manage all resident dues" ON public.resident_dues;
DROP POLICY IF EXISTS "Estate admins can manage own estate resident dues" ON public.resident_dues;
CREATE POLICY "Estate admins can manage own estate resident dues"
ON public.resident_dues FOR ALL TO authenticated
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

-- MEETINGS
DROP POLICY IF EXISTS "Admins can manage meetings" ON public.meetings;
DROP POLICY IF EXISTS "Estate admins can manage own estate meetings" ON public.meetings;
CREATE POLICY "Estate admins can manage own estate meetings"
ON public.meetings FOR ALL TO authenticated
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

-- ATTENDANCE
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Estate admins can manage own estate attendance" ON public.attendance;
CREATE POLICY "Estate admins can manage own estate attendance"
ON public.attendance FOR ALL TO authenticated
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

-- COMPLAINTS
DROP POLICY IF EXISTS "Admins can manage all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Estate admins can manage own estate complaints" ON public.complaints;
CREATE POLICY "Estate admins can manage own estate complaints"
ON public.complaints FOR ALL TO authenticated
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

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Estate admins can manage own estate announcements" ON public.announcements;
CREATE POLICY "Estate admins can manage own estate announcements"
ON public.announcements FOR ALL TO authenticated
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

-- DOCUMENTS
DROP POLICY IF EXISTS "Authenticated can view public documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view own estate public documents" ON public.documents;
CREATE POLICY "Users can view own estate public documents"
ON public.documents FOR SELECT TO authenticated
USING (
  is_public = true
  AND (
    estate_id = public.get_user_estate_id(auth.uid())
    OR public.is_super_admin(auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;
DROP POLICY IF EXISTS "Estate admins can manage own estate documents" ON public.documents;
CREATE POLICY "Estate admins can manage own estate documents"
ON public.documents FOR ALL TO authenticated
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

-- ACCESS CODES
DROP POLICY IF EXISTS "Security can view active access codes" ON public.access_codes;
CREATE POLICY "Security can view own estate active access codes"
ON public.access_codes FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'security'::app_role)
  AND estate_id = public.get_user_estate_id(auth.uid())
  AND is_used = false
  AND now() BETWEEN valid_from AND valid_until
);

DROP POLICY IF EXISTS "Security can mark access codes used" ON public.access_codes;
CREATE POLICY "Security can mark own estate access codes used"
ON public.access_codes FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'security'::app_role)
  AND estate_id = public.get_user_estate_id(auth.uid())
  AND is_used = false
  AND now() BETWEEN valid_from AND valid_until
)
WITH CHECK (
  public.has_role(auth.uid(), 'security'::app_role)
  AND estate_id = public.get_user_estate_id(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage access codes" ON public.access_codes;
DROP POLICY IF EXISTS "Estate admins can manage own estate access codes" ON public.access_codes;
CREATE POLICY "Estate admins can manage own estate access codes"
ON public.access_codes FOR ALL TO authenticated
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

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own estate notifications"
ON public.notifications FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  AND (
    estate_id IS NULL
    OR estate_id = public.get_user_estate_id(auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own estate notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  AND (
    estate_id IS NULL
    OR estate_id = public.get_user_estate_id(auth.uid())
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND (
    estate_id IS NULL
    OR estate_id = public.get_user_estate_id(auth.uid())
  )
);

-- STORAGE DOCUMENTS
DROP POLICY IF EXISTS "Admins can manage all documents" ON storage.objects;
DROP POLICY IF EXISTS "Estate admins can manage own estate document objects" ON storage.objects;
CREATE POLICY "Estate admins can manage own estate document objects"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_url LIKE '%' || storage.objects.name || '%'
        AND d.estate_id = public.get_user_estate_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin'::app_role)
    )
  )
)
WITH CHECK (
  bucket_id = 'documents'
  AND (
    public.is_super_admin(auth.uid())
    OR (storage.foldername(name))[1] = public.get_user_estate_id(auth.uid())::text
  )
);

DROP POLICY IF EXISTS "Users can view permitted documents" ON storage.objects;
CREATE POLICY "Users can view own estate permitted documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_url LIKE '%' || storage.objects.name || '%'
        AND d.estate_id = public.get_user_estate_id(auth.uid())
        AND (
          d.is_public = true
          OR d.uploaded_by = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  )
);
