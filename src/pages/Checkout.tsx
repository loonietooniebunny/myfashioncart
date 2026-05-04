import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { z } from "zod";

type PaySettings = {
  enable_card: boolean;
  enable_easypaisa: boolean;
  enable_jazzcash: boolean;
  enable_cod: boolean;
  easypaisa_account: string | null;
  easypaisa_name: string | null;
  jazzcash_account: string | null;
  jazzcash_name: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_title: string | null;
  bank_iban: string | null;
  cod_fee: number;
  shipping_fee: number;
  free_shipping_threshold: number;
  currency: string;
  instructions: string | null;
};

const schema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(7).max(20),
  shipping_address: z.string().trim().min(5).max(300),
  shipping_city: z.string().trim().min(2).max(80),
  shipping_state: z.string().trim().max(80).optional(),
  shipping_zip: z.string().trim().max(20).optional(),
  shipping_country: z.string().trim().min(2).max(80),
  payment_method: z.enum(["card", "easypaisa", "jazzcash", "cod"]),
  payment_reference: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState<PaySettings | null>(null);
  const [form, setForm] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    shipping_address: "", shipping_city: "", shipping_state: "", shipping_zip: "",
    shipping_country: "Pakistan",
    payment_method: "cod" as "card" | "easypaisa" | "jazzcash" | "cod",
    payment_reference: "",
    notes: "",
  });

  useEffect(() => {
    supabase.from("payment_settings").select("*").limit(1).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettings(data as PaySettings);
          const first = data.enable_cod ? "cod" : data.enable_easypaisa ? "easypaisa" : data.enable_jazzcash ? "jazzcash" : "card";
          setForm(f => ({ ...f, payment_method: first as any }));
        }
      });
  }, []);

  const currency = settings?.currency ?? "PKR";
  const baseShipping = settings?.shipping_fee ?? 0;
  const freeThreshold = settings?.free_shipping_threshold ?? 0;
  const codFee = form.payment_method === "cod" ? (settings?.cod_fee ?? 0) : 0;
  const shipping = items.length === 0 ? 0 : (subtotal >= freeThreshold && freeThreshold > 0 ? 0 : baseShipping);
  const total = subtotal + shipping + codFee;

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (form.payment_method !== "cod" && !form.payment_reference.trim()) {
      toast.error("Please enter the transaction ID / reference");
      return;
    }
    setBusy(true);
    const payload: any = {
      ...parsed.data,
      user_id: user?.id ?? null,
      items: items.map(i => ({ product_id: i.productId, name: i.name, size: i.size, qty: i.qty, price: i.price, image: i.image })),
      subtotal,
      shipping_fee: shipping + codFee,
      total,
      payment_status: form.payment_method === "cod" ? "pending" : "awaiting_verification",
      order_status: "pending",
    };
    const { error } = await supabase.from("orders" as any).insert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Order placed! We'll contact you shortly.");
    clear();
    nav("/");
  };

  const fmt = (n: number) => `${currency} ${n.toLocaleString()}`;

  return (
    <StoreLayout>
      <div className="container py-12 md:py-20 grid lg:grid-cols-2 gap-12">
        <form onSubmit={submit} className="space-y-8">
          <h1 className="font-serif text-4xl">Checkout</h1>

          <section className="space-y-3">
            <p className="text-xs tracking-luxe uppercase">Contact</p>
            <Input required placeholder="Full name" value={form.customer_name} onChange={update("customer_name")} className="rounded-none h-12" />
            <Input required type="email" placeholder="Email" value={form.customer_email} onChange={update("customer_email")} className="rounded-none h-12" />
            <Input required type="tel" placeholder="Phone (e.g. 03XX-XXXXXXX)" value={form.customer_phone} onChange={update("customer_phone")} className="rounded-none h-12" />
          </section>

          <section className="space-y-3">
            <p className="text-xs tracking-luxe uppercase">Shipping Address</p>
            <Input required placeholder="Address" value={form.shipping_address} onChange={update("shipping_address")} className="rounded-none h-12" />
            <div className="grid grid-cols-3 gap-3">
              <Input required placeholder="City" value={form.shipping_city} onChange={update("shipping_city")} className="rounded-none h-12" />
              <Input placeholder="Province" value={form.shipping_state} onChange={update("shipping_state")} className="rounded-none h-12" />
              <Input placeholder="ZIP" value={form.shipping_zip} onChange={update("shipping_zip")} className="rounded-none h-12" />
            </div>
            <Input required placeholder="Country" value={form.shipping_country} onChange={update("shipping_country")} className="rounded-none h-12" />
          </section>

          <section className="space-y-3">
            <p className="text-xs tracking-luxe uppercase">Payment Method</p>
            <RadioGroup value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v as any, payment_reference: "" })} className="space-y-2">
              {settings?.enable_cod && (
                <label className="flex items-start gap-3 border p-4 cursor-pointer hover:bg-secondary">
                  <RadioGroupItem value="cod" className="mt-1" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay in cash when your order arrives.{settings.cod_fee > 0 ? ` (+${fmt(settings.cod_fee)} fee)` : ""}</p>
                  </div>
                </label>
              )}
              {settings?.enable_easypaisa && (
                <label className="flex items-start gap-3 border p-4 cursor-pointer hover:bg-secondary">
                  <RadioGroupItem value="easypaisa" className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">EasyPaisa</p>
                    <p className="text-sm text-muted-foreground">Send to <b>{settings.easypaisa_account}</b> ({settings.easypaisa_name})</p>
                  </div>
                </label>
              )}
              {settings?.enable_jazzcash && (
                <label className="flex items-start gap-3 border p-4 cursor-pointer hover:bg-secondary">
                  <RadioGroupItem value="jazzcash" className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">JazzCash</p>
                    <p className="text-sm text-muted-foreground">Send to <b>{settings.jazzcash_account}</b> ({settings.jazzcash_name})</p>
                  </div>
                </label>
              )}
              {settings?.enable_card && (
                <label className="flex items-start gap-3 border p-4 cursor-pointer hover:bg-secondary">
                  <RadioGroupItem value="card" className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">Bank Transfer / Card</p>
                    <p className="text-sm text-muted-foreground">
                      {settings.bank_name} — {settings.bank_account_title}<br />
                      Acc: <b>{settings.bank_account_number}</b> · IBAN: <b>{settings.bank_iban}</b>
                    </p>
                  </div>
                </label>
              )}
            </RadioGroup>

            {form.payment_method !== "cod" && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs">Transaction ID / Reference</Label>
                <Input required placeholder="Enter TID after sending payment" value={form.payment_reference} onChange={update("payment_reference")} className="rounded-none h-12" />
                {settings?.instructions && <p className="text-xs text-muted-foreground">{settings.instructions}</p>}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <Label className="text-xs tracking-luxe uppercase">Order notes (optional)</Label>
            <Textarea value={form.notes} onChange={update("notes")} className="rounded-none" rows={3} />
          </section>

          <Button disabled={busy || items.length === 0} className="w-full rounded-none h-12 tracking-wider-2 text-xs uppercase">
            {busy ? "Placing order…" : `Place Order · ${fmt(total)}`}
          </Button>
        </form>

        <aside className="bg-secondary p-6 md:p-8 h-fit lg:sticky lg:top-28">
          <p className="text-xs tracking-luxe uppercase mb-4">Order Summary</p>
          <div className="divide-y">
            {items.length === 0 && <p className="text-sm text-muted-foreground py-6">Your bag is empty. <Link to="/" className="underline">Continue shopping</Link></p>}
            {items.map(i => (
              <div key={i.id} className="py-3 flex gap-3 text-sm">
                <img src={i.image} className="w-14 h-16 object-cover" alt="" />
                <div className="flex-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">Size {i.size} · Qty {i.qty}</p>
                </div>
                <p>{fmt(i.price * i.qty)}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : fmt(shipping)}</span></div>
            {codFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">COD fee</span><span>{fmt(codFee)}</span></div>}
            <div className="flex justify-between text-base pt-2 border-t mt-2"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
        </aside>
      </div>
    </StoreLayout>
  );
};

export default Checkout;
