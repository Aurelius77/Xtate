-- XTATE Phase 1: tenant foundation.
-- This migration introduces platform-level tenant tables while preserving the
-- existing estate_id-based application flows.

CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid UNIQUE REFERENCES public.estates(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  plan text NOT NULL DEFAULT 'basic' CHECK (plan IN ('free', 'standard', 'custom', 'basic', 'pro', 'enterprise')),
  logo_url text,
  primary_color text DEFAULT '#0891b2',
  secondary_color text DEFAULT '#0f172a',
  custom_domain text UNIQUE,
  currency text NOT NULL DEFAULT 'NGN',
  timezone text NOT NULL DEFAULT 'Africa/Lagos',
  address text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.tenant_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  limit_value integer,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, feature_key)
);

ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.tenant_billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'basic' CHECK (plan IN ('free', 'standard', 'custom', 'basic', 'pro', 'enterprise')),
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'expired', 'cancelled')),
  amount numeric(12, 2) NOT NULL DEFAULT 0,
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'custom')),
  renewal_date timestamptz,
  payment_reference text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_billing ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.platform_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_audit_log ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tenants_estate_id ON public.tenants(estate_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenant_features_tenant_id ON public.tenant_features(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_features_key ON public.tenant_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_tenant_billing_tenant_id ON public.tenant_billing(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_audit_log_tenant_id ON public.platform_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_audit_log_actor ON public.platform_audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_id ON public.support_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_by ON public.support_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON public.super_admins(user_id);

CREATE OR REPLACE FUNCTION public.is_platform_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_super_admin(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.super_admins
      WHERE user_id = _user_id
        AND is_active = true
    )
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id
  FROM public.profiles p
  JOIN public.tenants t ON t.estate_id = p.estate_id
  WHERE p.id = _user_id
  LIMIT 1
$$;

INSERT INTO public.tenants (
  id,
  estate_id,
  name,
  slug,
  status,
  plan,
  primary_color,
  secondary_color,
  currency,
  timezone,
  metadata
)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'Default Estate',
  'default',
  'active',
  'enterprise',
  '#0891b2',
  '#0f172a',
  'NGN',
  'Africa/Lagos',
  '{"source":"estate_bridge"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE
SET
  estate_id = EXCLUDED.estate_id,
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  plan = EXCLUDED.plan,
  updated_at = now();

INSERT INTO public.tenant_features (tenant_id, feature_key, enabled)
SELECT t.id, f.feature_key, true
FROM public.tenants t
CROSS JOIN (
  VALUES
    ('residents'),
    ('dues'),
    ('complaints'),
    ('meetings'),
    ('documents'),
    ('access_codes'),
    ('broadcast'),
    ('expenses'),
    ('data_import'),
    ('security_management'),
    ('audit_logs'),
    ('white_label'),
    ('custom_domain'),
    ('wallet'),
    ('marketplace'),
    ('forum'),
    ('technicians'),
    ('advanced_analytics'),
    ('no_ads'),
    ('api_access')
) AS f(feature_key)
WHERE t.slug = 'default'
ON CONFLICT (tenant_id, feature_key) DO UPDATE
SET enabled = EXCLUDED.enabled,
    updated_at = now();

INSERT INTO public.tenant_billing (tenant_id, plan, status, amount, billing_cycle)
SELECT id, plan, 'active', 0, 'monthly'
FROM public.tenants
WHERE slug = 'default'
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Platform super admins can manage tenants" ON public.tenants;
CREATE POLICY "Platform super admins can manage tenants"
  ON public.tenants FOR ALL
  TO authenticated
  USING (public.is_platform_super_admin(auth.uid()))
  WITH CHECK (public.is_platform_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
CREATE POLICY "Users can view own tenant"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (id = public.get_user_tenant_id(auth.uid()));

DROP POLICY IF EXISTS "Platform super admins can manage tenant features" ON public.tenant_features;
CREATE POLICY "Platform super admins can manage tenant features"
  ON public.tenant_features FOR ALL
  TO authenticated
  USING (public.is_platform_super_admin(auth.uid()))
  WITH CHECK (public.is_platform_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own tenant features" ON public.tenant_features;
CREATE POLICY "Users can view own tenant features"
  ON public.tenant_features FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

DROP POLICY IF EXISTS "Platform super admins can manage tenant billing" ON public.tenant_billing;
CREATE POLICY "Platform super admins can manage tenant billing"
  ON public.tenant_billing FOR ALL
  TO authenticated
  USING (public.is_platform_super_admin(auth.uid()))
  WITH CHECK (public.is_platform_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Tenant admins can view own billing" ON public.tenant_billing;
CREATE POLICY "Tenant admins can view own billing"
  ON public.tenant_billing FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Platform super admins can view audit log" ON public.platform_audit_log;
CREATE POLICY "Platform super admins can view audit log"
  ON public.platform_audit_log FOR SELECT
  TO authenticated
  USING (public.is_platform_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Tenant admins can view own audit log" ON public.platform_audit_log;
CREATE POLICY "Tenant admins can view own audit log"
  ON public.platform_audit_log FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Authenticated users can append own tenant audit log" ON public.platform_audit_log;
CREATE POLICY "Authenticated users can append own tenant audit log"
  ON public.platform_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_user_id = auth.uid()
    AND tenant_id = public.get_user_tenant_id(auth.uid())
  );

DROP POLICY IF EXISTS "Platform super admins can manage support tickets" ON public.support_tickets;
CREATE POLICY "Platform super admins can manage support tickets"
  ON public.support_tickets FOR ALL
  TO authenticated
  USING (public.is_platform_super_admin(auth.uid()))
  WITH CHECK (public.is_platform_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can create own tenant support tickets" ON public.support_tickets;
CREATE POLICY "Users can create own tenant support tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND tenant_id = public.get_user_tenant_id(auth.uid())
  );

DROP POLICY IF EXISTS "Users can view own tenant support tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tenant support tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (
      created_by = auth.uid()
      OR public.has_role(auth.uid(), 'admin'::app_role)
    )
  );

DROP POLICY IF EXISTS "Tenant admins can update own support tickets" ON public.support_tickets;
CREATE POLICY "Tenant admins can update own support tickets"
  ON public.support_tickets FOR UPDATE
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Role super admins can manage super admins" ON public.super_admins;
CREATE POLICY "Role super admins can manage super admins"
  ON public.super_admins FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own super admin record" ON public.super_admins;
CREATE POLICY "Users can view own super admin record"
  ON public.super_admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tenant_features_updated_at
  BEFORE UPDATE ON public.tenant_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tenant_billing_updated_at
  BEFORE UPDATE ON public.tenant_billing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_super_admins_updated_at
  BEFORE UPDATE ON public.super_admins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

REVOKE EXECUTE ON FUNCTION public.is_platform_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_platform_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) TO authenticated;
