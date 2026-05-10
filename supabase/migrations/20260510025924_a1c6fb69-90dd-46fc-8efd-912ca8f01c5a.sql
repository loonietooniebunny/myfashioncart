CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_user_is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;

DROP POLICY IF EXISTS "Users see own roles" ON public.user_roles;
CREATE POLICY "Users see own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Products public read active" ON public.products;
CREATE POLICY "Products public read active" ON public.products
FOR SELECT TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Products admin read all" ON public.products;
CREATE POLICY "Products admin read all" ON public.products
FOR SELECT TO authenticated
USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Reviews public read approved" ON public.reviews;
CREATE POLICY "Reviews public read approved" ON public.reviews
FOR SELECT TO public
USING (is_approved = true);

DROP POLICY IF EXISTS "Reviews admins read all" ON public.reviews;
CREATE POLICY "Reviews admins read all" ON public.reviews
FOR SELECT TO authenticated
USING (public.current_user_is_admin());

DROP POLICY IF EXISTS "Reviews users read own" ON public.reviews;
CREATE POLICY "Reviews users read own" ON public.reviews
FOR SELECT TO authenticated
USING (auth.uid() = user_id);