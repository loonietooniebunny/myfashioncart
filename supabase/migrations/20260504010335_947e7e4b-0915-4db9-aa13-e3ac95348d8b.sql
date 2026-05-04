
-- Fix function search paths
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Revoke execute on definer functions from public/authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Replace broad SELECT on storage.objects with admin-only listing.
-- (Public files remain accessible via their public URL because the bucket is public.)
DROP POLICY IF EXISTS "Product images public read" ON storage.objects;
CREATE POLICY "Product images admin list" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
