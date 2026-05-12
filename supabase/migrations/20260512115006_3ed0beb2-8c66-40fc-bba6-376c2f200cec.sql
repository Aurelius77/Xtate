
-- Revoke broad EXECUTE on the signup trigger function (only fires from auth schema as definer)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Replace overly broad public profile-images SELECT (which allows bucket listing)
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;

CREATE POLICY "Profile images are viewable by path"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] IS NOT NULL
);
