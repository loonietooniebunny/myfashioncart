
-- grant admin to existing user
INSERT INTO public.user_roles (user_id, role)
VALUES ('4e4b5ae8-204f-4c54-92ff-ed4ad2f681bf', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  shipping_city text NOT NULL,
  shipping_state text,
  shipping_zip text,
  shipping_country text NOT NULL DEFAULT 'Pakistan',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  shipping_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  payment_reference text,
  payment_status text NOT NULL DEFAULT 'pending',
  order_status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place an order" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users see own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- payment settings
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enable_card boolean NOT NULL DEFAULT true,
  enable_easypaisa boolean NOT NULL DEFAULT true,
  enable_jazzcash boolean NOT NULL DEFAULT true,
  enable_cod boolean NOT NULL DEFAULT true,
  easypaisa_account text,
  easypaisa_name text,
  jazzcash_account text,
  jazzcash_name text,
  bank_name text,
  bank_account_number text,
  bank_account_title text,
  bank_iban text,
  cod_fee numeric NOT NULL DEFAULT 0,
  shipping_fee numeric NOT NULL DEFAULT 200,
  free_shipping_threshold numeric NOT NULL DEFAULT 5000,
  currency text NOT NULL DEFAULT 'PKR',
  instructions text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read payment settings" ON public.payment_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage payment settings" ON public.payment_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER payment_settings_set_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.payment_settings (
  easypaisa_account, easypaisa_name,
  jazzcash_account, jazzcash_name,
  bank_name, bank_account_number, bank_account_title, bank_iban,
  instructions
) VALUES (
  '03001234567', 'Store Owner',
  '03007654321', 'Store Owner',
  'Meezan Bank', '01234567890123', 'Store Owner', 'PK00MEZN0000000000000000',
  'After payment, please share the transaction ID / screenshot via WhatsApp to confirm your order.'
);
