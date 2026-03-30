
-- Create estates table
CREATE TABLE public.estates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  subscription_plan text NOT NULL DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro', 'enterprise')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.estates ENABLE ROW LEVEL SECURITY;

-- Create estate_settings table
CREATE TABLE public.estate_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid REFERENCES public.estates(id) ON DELETE CASCADE NOT NULL UNIQUE,
  brand_name text,
  logo_url text,
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#1e293b',
  custom_domain text,
  email_sender_name text,
  support_contact text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.estate_settings ENABLE ROW LEVEL SECURITY;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid REFERENCES public.estates(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'expired', 'trial', 'cancelled')),
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Default estate for backward compatibility
INSERT INTO public.estates (id, name, slug, status, subscription_plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Estate', 'default', 'active', 'enterprise');

INSERT INTO public.estate_settings (estate_id, brand_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'EstateConnect');

INSERT INTO public.subscriptions (estate_id, plan, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'enterprise', 'active');

-- Add estate_id to all core tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
ALTER TABLE public.residents ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
ALTER TABLE public.dues ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
ALTER TABLE public.resident_dues ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
ALTER TABLE public.access_codes ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS estate_id uuid REFERENCES public.estates(id) ON DELETE SET NULL;

-- Backfill existing records
UPDATE public.profiles SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;
UPDATE public.residents SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;
UPDATE public.dues SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;
UPDATE public.resident_dues SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;
UPDATE public.meetings SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;
UPDATE public.attendance SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;
UPDATE public.complaints SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;
UPDATE public.announcements SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;
UPDATE public.documents SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;
UPDATE public.access_codes SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;
UPDATE public.notifications SET estate_id = '00000000-0000-0000-0000-000000000001' WHERE estate_id IS NULL;

-- Set defaults
ALTER TABLE public.profiles ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.residents ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.dues ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.resident_dues ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.meetings ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.attendance ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.complaints ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.announcements ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.documents ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.access_codes ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.notifications ALTER COLUMN estate_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_estate_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT estate_id FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- RLS for estates
CREATE POLICY "Super admins can manage all estates"
  ON public.estates FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view own estate"
  ON public.estates FOR SELECT
  TO authenticated
  USING (id = public.get_user_estate_id(auth.uid()));

-- RLS for estate_settings
CREATE POLICY "Super admins can manage all estate settings"
  ON public.estate_settings FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view own estate settings"
  ON public.estate_settings FOR SELECT
  TO authenticated
  USING (estate_id = public.get_user_estate_id(auth.uid()));

CREATE POLICY "Estate admins can update own estate settings"
  ON public.estate_settings FOR UPDATE
  TO authenticated
  USING (estate_id = public.get_user_estate_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- RLS for subscriptions
CREATE POLICY "Super admins can manage all subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Estate admins can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (estate_id = public.get_user_estate_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- RLS for audit_logs
CREATE POLICY "Super admins can view all audit logs"
  ON public.audit_logs FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Estate admins can view own estate audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (estate_id = public.get_user_estate_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _estate_id uuid;
BEGIN
  _estate_id := COALESCE(
    (NEW.raw_user_meta_data->>'estate_id')::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid
  );

  INSERT INTO public.profiles (id, full_name, email, phone, estate_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    _estate_id
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'resident')
  );
  
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'resident') = 'resident' THEN
    INSERT INTO public.residents (user_id, house_unit_number, estate_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'house_unit', ''),
      _estate_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Updated_at triggers
CREATE TRIGGER update_estates_updated_at
  BEFORE UPDATE ON public.estates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_estate_settings_updated_at
  BEFORE UPDATE ON public.estate_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
