-- Allow estate admins to create notifications for users in their own estate.
-- Residents still only read/update their own notifications through existing policies.
DROP POLICY IF EXISTS "Estate admins can create own estate notifications" ON public.notifications;

CREATE POLICY "Estate admins can create own estate notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND estate_id = public.get_user_estate_id(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.residents
      WHERE residents.user_id = notifications.user_id
        AND residents.estate_id = notifications.estate_id
    )
  )
);
