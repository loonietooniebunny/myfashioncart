CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'::public.app_role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.current_user_is_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;

DROP POLICY IF EXISTS "Categories admin write" ON public.categories;
CREATE POLICY "Categories admin write" ON public.categories
FOR ALL TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Products admin write" ON public.products;
CREATE POLICY "Products admin write" ON public.products
FOR ALL TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Orders admin manage" ON public.orders;
DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders" ON public.orders
FOR ALL TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins manage payment settings" ON public.payment_settings;
CREATE POLICY "Admins manage payment settings" ON public.payment_settings
FOR ALL TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Shipping zones admin write" ON public.shipping_zones;
CREATE POLICY "Shipping zones admin write" ON public.shipping_zones
FOR ALL TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Site settings admin write" ON public.site_settings;
CREATE POLICY "Site settings admin write" ON public.site_settings
FOR ALL TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;
CREATE POLICY "Admins manage reviews" ON public.reviews
FOR ALL TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Admins manage all addresses" ON public.user_addresses;
CREATE POLICY "Admins manage all addresses" ON public.user_addresses
FOR ALL TO authenticated
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "Product images admin insert" ON storage.objects;
CREATE POLICY "Product images admin insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.current_user_is_admin());

DROP POLICY IF EXISTS "Product images admin update" ON storage.objects;
CREATE POLICY "Product images admin update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND public.current_user_is_admin())
WITH CHECK (bucket_id = 'product-images' AND public.current_user_is_admin());

DROP POLICY IF EXISTS "Product images admin delete" ON storage.objects;
CREATE POLICY "Product images admin delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND public.current_user_is_admin());