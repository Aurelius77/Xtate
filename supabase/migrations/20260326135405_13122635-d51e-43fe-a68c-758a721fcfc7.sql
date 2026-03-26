
-- ==========================================
-- 1. Create ENUM types
-- ==========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'resident', 'security');
CREATE TYPE public.due_frequency AS ENUM ('one_time', 'monthly', 'quarterly', 'annually');
CREATE TYPE public.due_status AS ENUM ('pending', 'paid', 'overdue', 'pending_confirmation');
CREATE TYPE public.complaint_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent');
CREATE TYPE public.access_code_status AS ENUM ('active', 'used', 'expired', 'cancelled');
CREATE TYPE public.notification_type AS ENUM ('dues', 'meeting', 'complaint', 'announcement', 'payment');

-- ==========================================
-- 2. Profiles table (linked to auth.users)
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  profile_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. User roles table (separate from profiles)
-- ==========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'resident',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. Security definer function for role checks
-- ==========================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper to get primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- ==========================================
-- 5. Residents table
-- ==========================================
CREATE TABLE public.residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  house_unit_number TEXT NOT NULL DEFAULT '',
  date_moved_in DATE,
  employment_info TEXT,
  emergency_contact TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. Dues table
-- ==========================================
CREATE TABLE public.dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  frequency due_frequency NOT NULL DEFAULT 'one_time',
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dues ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 7. Resident dues (payments tracking)
-- ==========================================
CREATE TABLE public.resident_dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  due_id UUID REFERENCES public.dues(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status due_status NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMPTZ
);

ALTER TABLE public.resident_dues ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 8. Meetings table
-- ==========================================
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  meeting_date TIMESTAMPTZ NOT NULL,
  attendance_window_start TIMESTAMPTZ NOT NULL,
  attendance_window_end TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 9. Attendance table
-- ==========================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'absent',
  marked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (meeting_id, resident_id)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 10. Complaints table
-- ==========================================
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  status complaint_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 11. Announcements table
-- ==========================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 12. Documents table
-- ==========================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_size TEXT,
  category TEXT DEFAULT 'general',
  uploaded_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 13. Access codes table
-- ==========================================
CREATE TABLE public.access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT,
  access_code TEXT NOT NULL UNIQUE,
  purpose TEXT,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  used_by_security UUID REFERENCES auth.users(id),
  status access_code_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 14. Notifications table
-- ==========================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  type notification_type NOT NULL DEFAULT 'announcement',
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 15. RLS POLICIES
-- ==========================================

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Profiles are insertable on signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- USER ROLES
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RESIDENTS
CREATE POLICY "Residents can view own record" ON public.residents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all residents" ON public.residents
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Security can view residents" ON public.residents
  FOR SELECT USING (public.has_role(auth.uid(), 'security'));

CREATE POLICY "Residents can insert own record" ON public.residents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DUES
CREATE POLICY "Admins can manage dues" ON public.dues
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active dues" ON public.dues
  FOR SELECT TO authenticated USING (is_active = true);

-- RESIDENT DUES
CREATE POLICY "Residents can view own dues" ON public.resident_dues
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.residents WHERE id = resident_dues.resident_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all resident dues" ON public.resident_dues
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Residents can update own due status" ON public.resident_dues
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.residents WHERE id = resident_dues.resident_id AND user_id = auth.uid())
  );

-- MEETINGS
CREATE POLICY "Authenticated users can view meetings" ON public.meetings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage meetings" ON public.meetings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ATTENDANCE
CREATE POLICY "Residents can view own attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.residents WHERE id = attendance.resident_id AND user_id = auth.uid())
  );

CREATE POLICY "Residents can mark own attendance" ON public.attendance
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.residents WHERE id = attendance.resident_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- COMPLAINTS
CREATE POLICY "Residents can view own complaints" ON public.complaints
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.residents WHERE id = complaints.resident_id AND user_id = auth.uid())
  );

CREATE POLICY "Residents can create complaints" ON public.complaints
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.residents WHERE id = complaints.resident_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all complaints" ON public.complaints
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ANNOUNCEMENTS
CREATE POLICY "Authenticated users can view announcements" ON public.announcements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- DOCUMENTS
CREATE POLICY "Authenticated can view public documents" ON public.documents
  FOR SELECT TO authenticated USING (is_public = true);

CREATE POLICY "Admins can manage all documents" ON public.documents
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ACCESS CODES
CREATE POLICY "Residents can view own access codes" ON public.access_codes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.residents WHERE id = access_codes.resident_id AND user_id = auth.uid())
  );

CREATE POLICY "Residents can create access codes" ON public.access_codes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.residents WHERE id = access_codes.resident_id AND user_id = auth.uid())
  );

CREATE POLICY "Security can view and update access codes" ON public.access_codes
  FOR SELECT USING (public.has_role(auth.uid(), 'security'));

CREATE POLICY "Security can update access codes" ON public.access_codes
  FOR UPDATE USING (public.has_role(auth.uid(), 'security'));

CREATE POLICY "Admins can manage access codes" ON public.access_codes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 16. Auto-create profile on signup trigger
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  -- Assign default role from metadata or 'resident'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'resident')
  );
  
  -- If role is resident, create a residents record
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'resident') = 'resident' THEN
    INSERT INTO public.residents (user_id, house_unit_number)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'house_unit', '')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 17. Updated_at trigger function
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
