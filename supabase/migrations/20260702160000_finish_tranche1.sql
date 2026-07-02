-- Finish Tranche 1: exit access logging, inactivity PIN hashing, PDF receipts,
-- and storage buckets for complaint media and payment receipts.

-- ==========================================
-- Exit access logging
-- ==========================================
ALTER TABLE public.access_codes
  ADD COLUMN IF NOT EXISTS exit_logged BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exited_at TIMESTAMPTZ;

-- The Phase 1 RLS pass (20260527120000) scoped security's access_codes SELECT/UPDATE
-- policies to `is_used = false` only, since at the time "used" meant "done". Exit
-- logging introduces a second state transition (is_used=true -> exit_logged=true) that
-- those policies don't cover, so security needs explicit access to already-used,
-- not-yet-exited codes in their own estate.
CREATE POLICY "Security can view own estate visitors on site"
ON public.access_codes FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'security'::app_role)
  AND estate_id = public.get_user_estate_id(auth.uid())
  AND is_used = true
  AND exit_logged = false
);

CREATE POLICY "Security can log exit for own estate visitors"
ON public.access_codes FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'security'::app_role)
  AND estate_id = public.get_user_estate_id(auth.uid())
  AND is_used = true
  AND exit_logged = false
)
WITH CHECK (
  public.has_role(auth.uid(), 'security'::app_role)
  AND estate_id = public.get_user_estate_id(auth.uid())
);

-- ==========================================
-- Inactivity-lock PIN (hashed, per-user)
-- ==========================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS inactivity_pin_hash TEXT;

-- ==========================================
-- PDF receipts
-- ==========================================
ALTER TABLE public.resident_dues
  ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- ==========================================
-- Storage buckets
-- ==========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('complaint-media', 'complaint-media', false, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime']),
  ('receipts', 'receipts', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- complaint-media: estate-scoped like documents (path starts with estate_id folder)
CREATE POLICY "Admins can manage complaint media"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'complaint-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view complaint media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'complaint-media');

CREATE POLICY "Residents can upload complaint media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'complaint-media');

-- receipts: service role (edge function) writes; admins manage; authenticated users can
-- read via signed URL, mirroring the existing documents-bucket policy shape.
CREATE POLICY "Admins can manage receipts"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts');
