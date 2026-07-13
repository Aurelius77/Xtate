-- Tranche 2: Super Admin completion (audit log writes, platform settings),
-- Community Forum, Marketplace, Hire a Technician, and the recurring dues engine.

-- ==========================================
-- Recurring dues: next_run_date acts as a baton handed from one period's
-- due row to the next when the scheduled generator runs.
-- ==========================================
ALTER TABLE public.dues
  ADD COLUMN IF NOT EXISTS next_run_date DATE,
  ADD COLUMN IF NOT EXISTS last_generated_at TIMESTAMPTZ;

-- ==========================================
-- Platform settings (singleton row, super-admin only)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL DEFAULT 'XTATE',
  support_email TEXT NOT NULL DEFAULT 'support@xtate.app',
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  allow_new_registrations BOOLEAN NOT NULL DEFAULT true,
  trial_mode_enabled BOOLEAN NOT NULL DEFAULT true,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.platform_settings (id)
VALUES ('00000000-0000-0000-0000-0000000000f5')
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Platform super admins can manage platform settings"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (public.is_platform_super_admin(auth.uid()))
  WITH CHECK (public.is_platform_super_admin(auth.uid()));

-- ==========================================
-- Community Forum
-- ==========================================
CREATE TABLE IF NOT EXISTS public.forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE NOT NULL,
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE NOT NULL,
  thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE NOT NULL,
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_forum_threads_estate_id ON public.forum_threads(estate_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON public.forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_estate_id ON public.forum_replies(estate_id);

CREATE POLICY "Estate members can view own estate threads"
  ON public.forum_threads FOR SELECT TO authenticated
  USING (estate_id = public.get_user_estate_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Residents can create threads in own estate"
  ON public.forum_threads FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.residents WHERE id = forum_threads.resident_id AND user_id = auth.uid())
    AND estate_id = public.get_user_estate_id(auth.uid())
  );

CREATE POLICY "Estate admins can manage own estate threads"
  ON public.forum_threads FOR UPDATE TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR (public.has_role(auth.uid(), 'admin'::app_role) AND estate_id = public.get_user_estate_id(auth.uid()))
  );

CREATE POLICY "Estate admins can delete own estate threads"
  ON public.forum_threads FOR DELETE TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR (public.has_role(auth.uid(), 'admin'::app_role) AND estate_id = public.get_user_estate_id(auth.uid()))
  );

CREATE POLICY "Estate members can view own estate replies"
  ON public.forum_replies FOR SELECT TO authenticated
  USING (estate_id = public.get_user_estate_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Residents can reply in own estate"
  ON public.forum_replies FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.residents WHERE id = forum_replies.resident_id AND user_id = auth.uid())
    AND estate_id = public.get_user_estate_id(auth.uid())
    AND NOT EXISTS (SELECT 1 FROM public.forum_threads WHERE id = forum_replies.thread_id AND is_locked = true)
  );

CREATE POLICY "Estate admins can delete own estate replies"
  ON public.forum_replies FOR DELETE TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR (public.has_role(auth.uid(), 'admin'::app_role) AND estate_id = public.get_user_estate_id(auth.uid()))
  );

-- ==========================================
-- Marketplace
-- ==========================================
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE NOT NULL,
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_estate_id ON public.marketplace_listings(estate_id);

CREATE POLICY "Estate members can view own estate listings"
  ON public.marketplace_listings FOR SELECT TO authenticated
  USING (estate_id = public.get_user_estate_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Residents can create own listings"
  ON public.marketplace_listings FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.residents WHERE id = marketplace_listings.resident_id AND user_id = auth.uid())
    AND estate_id = public.get_user_estate_id(auth.uid())
  );

CREATE POLICY "Residents can update own listings"
  ON public.marketplace_listings FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.residents WHERE id = marketplace_listings.resident_id AND user_id = auth.uid())
    OR public.is_super_admin(auth.uid())
    OR (public.has_role(auth.uid(), 'admin'::app_role) AND estate_id = public.get_user_estate_id(auth.uid()))
  );

CREATE POLICY "Estate admins can delete own estate listings"
  ON public.marketplace_listings FOR DELETE TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR (public.has_role(auth.uid(), 'admin'::app_role) AND estate_id = public.get_user_estate_id(auth.uid()))
    OR EXISTS (SELECT 1 FROM public.residents WHERE id = marketplace_listings.resident_id AND user_id = auth.uid())
  );

-- ==========================================
-- Hire a Technician
-- ==========================================
CREATE TABLE IF NOT EXISTS public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  phone TEXT NOT NULL,
  rate_info TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.technician_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES public.estates(id) ON DELETE CASCADE NOT NULL,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  requested_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_technicians_estate_id ON public.technicians(estate_id);
CREATE INDEX IF NOT EXISTS idx_technician_bookings_estate_id ON public.technician_bookings(estate_id);
CREATE INDEX IF NOT EXISTS idx_technician_bookings_resident_id ON public.technician_bookings(resident_id);

CREATE POLICY "Estate members can view own estate technicians"
  ON public.technicians FOR SELECT TO authenticated
  USING (estate_id = public.get_user_estate_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Estate admins can manage own estate technicians"
  ON public.technicians FOR ALL TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR (public.has_role(auth.uid(), 'admin'::app_role) AND estate_id = public.get_user_estate_id(auth.uid()))
  )
  WITH CHECK (
    public.is_super_admin(auth.uid())
    OR (public.has_role(auth.uid(), 'admin'::app_role) AND estate_id = public.get_user_estate_id(auth.uid()))
  );

CREATE POLICY "Residents can view own bookings, admins view estate bookings"
  ON public.technician_bookings FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.residents WHERE id = technician_bookings.resident_id AND user_id = auth.uid())
    OR public.is_super_admin(auth.uid())
    OR (public.has_role(auth.uid(), 'admin'::app_role) AND estate_id = public.get_user_estate_id(auth.uid()))
  );

CREATE POLICY "Residents can request own bookings"
  ON public.technician_bookings FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.residents WHERE id = technician_bookings.resident_id AND user_id = auth.uid())
    AND estate_id = public.get_user_estate_id(auth.uid())
  );

CREATE POLICY "Estate admins can update own estate bookings"
  ON public.technician_bookings FOR UPDATE TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR (public.has_role(auth.uid(), 'admin'::app_role) AND estate_id = public.get_user_estate_id(auth.uid()))
  );

-- ==========================================
-- Marketplace storage bucket (public — listing photos aren't sensitive,
-- and a public browse gallery shouldn't need a signed-URL round trip per image)
-- ==========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('marketplace-listings', 'marketplace-listings', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view marketplace listing photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'marketplace-listings');

CREATE POLICY "Authenticated users can upload marketplace listing photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'marketplace-listings');

CREATE POLICY "Authenticated users can delete their marketplace listing photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'marketplace-listings');

-- ==========================================
-- platform_audit_log: the existing INSERT policy (from the tenant foundation
-- migration) requires actor_user_id = auth.uid() AND tenant_id =
-- get_user_tenant_id(auth.uid()) — that only covers a super admin logging
-- actions against their OWN tenant. Super admins log actions against OTHER
-- tenants constantly (creating tenants, toggling flags, impersonating), so
-- add a platform-super-admin policy that allows logging against any tenant_id.
-- ==========================================
CREATE POLICY "Platform super admins can append any tenant audit log"
  ON public.platform_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_user_id = auth.uid()
    AND public.is_platform_super_admin(auth.uid())
  );

-- ==========================================
-- Recurring dues cron job
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Replace <PROJECT_REF> below with your Supabase project ref, and set the
-- CRON_SECRET edge function secret to match the placeholder header value
-- here before relying on this job — see finish_tranche1.sql's RESEND_API_KEY
-- note for the same manual-step pattern. The service-role key is deliberately
-- NOT embedded here; generate-recurring-dues authenticates the caller via
-- this shared secret header instead.
SELECT cron.schedule(
  'xtate-generate-recurring-dues',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/generate-recurring-dues',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', 'REPLACE_WITH_CRON_SECRET'),
    body := '{}'::jsonb
  );
  $$
);
