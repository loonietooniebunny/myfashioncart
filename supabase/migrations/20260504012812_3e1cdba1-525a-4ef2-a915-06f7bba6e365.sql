
-- shipping zones
CREATE TABLE public.shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL UNIQUE,
  fee numeric NOT NULL DEFAULT 0,
  cod_fee numeric NOT NULL DEFAULT 0,
  estimated_days text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shipping zones public read" ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY "Shipping zones admin write" ON public.shipping_zones FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER shipping_zones_updated BEFORE UPDATE ON public.shipping_zones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.shipping_zones (city, fee, cod_fee, estimated_days) VALUES
  ('Karachi', 200, 50, '2-3 days'),
  ('Lahore', 250, 50, '2-4 days'),
  ('Islamabad', 250, 50, '2-4 days'),
  ('Rawalpindi', 250, 50, '2-4 days'),
  ('Faisalabad', 280, 50, '3-5 days'),
  ('Multan', 300, 50, '3-5 days'),
  ('Peshawar', 320, 80, '4-6 days'),
  ('Quetta', 400, 100, '5-7 days'),
  ('Sialkot', 280, 50, '3-5 days'),
  ('Hyderabad', 280, 50, '3-5 days'),
  ('Gujranwala', 280, 50, '3-5 days'),
  ('Bahawalpur', 320, 80, '4-6 days'),
  ('Sargodha', 300, 80, '3-5 days'),
  ('Abbottabad', 350, 80, '4-6 days'),
  ('Other', 400, 100, '5-8 days');

-- orders extra fields
ALTER TABLE public.orders
  ADD COLUMN tracking_number text,
  ADD COLUMN fulfillment_note text,
  ADD COLUMN receipt_url text;

-- receipts bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', true);
CREATE POLICY "Receipts public read" ON storage.objects FOR SELECT USING (bucket_id = 'payment-receipts');
CREATE POLICY "Anyone upload receipt" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-receipts');
CREATE POLICY "Admins delete receipts" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-receipts' AND has_role(auth.uid(), 'admin'));
