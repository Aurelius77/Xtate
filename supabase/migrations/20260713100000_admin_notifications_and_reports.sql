-- Admin notification center: allow admins to delete their own notifications,
-- and auto-notify the estate admin on events they need to act on (new
-- complaint, resident payment awaiting confirmation) so the new admin
-- Notifications page has real data to show without residents needing
-- direct INSERT access to another user's notifications.

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.notify_estate_admin(
  p_estate_id uuid,
  p_title text,
  p_message text,
  p_type public.notification_type,
  p_related_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  SELECT ur.user_id INTO v_admin_id
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  WHERE ur.role = 'admin' AND p.estate_id = p_estate_id
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, estate_id, title, message, type, related_id, is_read)
    VALUES (v_admin_id, p_estate_id, p_title, p_message, p_type, p_related_id, false);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_complaint()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.estate_id IS NOT NULL THEN
    PERFORM public.notify_estate_admin(
      NEW.estate_id,
      'New Complaint Filed',
      NEW.title,
      'complaint',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS complaints_notify_admin ON public.complaints;
CREATE TRIGGER complaints_notify_admin
AFTER INSERT ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_admin_new_complaint();

CREATE OR REPLACE FUNCTION public.trg_notify_admin_payment_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'pending_confirmation'
     AND (OLD.status IS DISTINCT FROM 'pending_confirmation')
     AND NEW.estate_id IS NOT NULL THEN
    PERFORM public.notify_estate_admin(
      NEW.estate_id,
      'Payment Awaiting Confirmation',
      'A resident payment of ' || to_char(NEW.amount, 'FM999,999,999') || ' needs confirmation.',
      'payment',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS resident_dues_notify_admin ON public.resident_dues;
CREATE TRIGGER resident_dues_notify_admin
AFTER UPDATE ON public.resident_dues
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_admin_payment_pending();
