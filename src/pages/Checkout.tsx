import { useEffect, useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { Upload } from "lucide-react";

type PaySettings = any;
type Zone = { id: string; city: string; fee: number; cod_fee: number; estimated_days: string | null; is_active: boolean };

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
  const [zones, setZones] = useState<Zone[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    shipping_address: "", shipping_city: "", shipping_state: "", shipping_zip: "",
    shipping_country: "Pakistan",
    payment_method: "cod" as "card" | "easypaisa" | "jazzcash" | "cod",
    payment_reference: "",
    notes: "",
  });

  useEffect(() => {
    supabase.from("payment_settings" as any).select("*").limit(1).maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setSettings(data);
          const first = data.enable_cod ? "cod" : data.enable_easypaisa ? "easypaisa" : data.enable_jazzcash ? "jazzcash" : "card";
          setForm(f => ({ ...f, payment_method: first as any }));
        }
      });
    (supabase as any).from("shipping_zones").select("*").eq("is_active", true).order("city")
      .then(({ data }: any) => setZones(data ?? []));
  }, []);

  const currency = settings?.currency ?? "PKR";
  const selectedZone = useMemo(() => zones.find(z => z.city === form.shipping_city), [zones, form.shipping_city]);
  const baseShipping = selectedZone?.fee ?? settings?.shipping_fee ?? 0;
  const freeThreshold = settings?.free_shipping_threshold ?? 0;
  const codFee = form.payment_method === "cod" ? (selectedZone?.cod_fee ?? settings?.cod_fee ?? 0) : 0;
  const shipping = items.length === 0 ? 0 : (subtotal >= freeThreshold && freeThreshold > 0 ? 0 : baseShipping);
  const total = subtotal + shipping + codFee;

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (form.payment_method !== "cod" && !form.payment_reference.trim()) {
      toast.error("Please enter the transaction ID / reference");
      return;
    }
    setBusy(true);

    let receipt_url: string | null = null;
    if (receiptFile && form.payment_method !== "cod") {
      const ext = receiptFile.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-receipts").upload(path, receiptFile);
      if (upErr) { setBusy(false); toast.error(upErr.message); return; }
      receipt_url = supabase.storage.from("payment-receipts").getPublicUrl(path).data.publicUrl;
    }

    const payload: any = {
      ...parsed.data,
      user_id: user?.id ?? null,
      items: items.map(i => ({ product_id: i.productId, name: i.name, size: i.size, qty: i.qty, price: i.price, image: i.image })),
      subtotal,
      shipping_fee: shipping + codFee,
      total,
      payment_status: form.payment_method === "cod" ? "pending" : "awaiting_verification",
      order_status: "pending",
      receipt_url,
    };
    const { data: inserted, error } = await supabase.from("orders" as any).insert(payload).select("id").single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Order placed! Tracking your delivery now.");
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([120, 60, 120]);
      }
      if (typeof window !== "undefined" && "Notification" in window) {
        const notify = () => new Notification("Order confirmed ✓", {
          body: `Thanks ${form.customer_name.split(" ")[0] || ""}! Your order of ${fmt(total)} is being processed.`,
          icon: settings?.logo_url || "/placeholder.svg",
          tag: "order-confirmed",
        });
        if (Notification.permission === "granted") notify();
        else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(p => p === "granted" && notify());
        }
      }
    } catch {}
    clear();
    nav(`/order/${(inserted as any)?.id ?? ""}`);
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
              <Select value={form.shipping_city} onValueChange={(v) => setForm({ ...form, shipping_city: v })}>
                <SelectTrigger className="rounded-none h-12"><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {zones.map(z => <SelectItem key={z.id} value={z.city}>{z.city} — {currency} {z.fee}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Province" value={form.shipping_state} onChange={update("shipping_state")} className="rounded-none h-12" />
              <Input placeholder="ZIP" value={form.shipping_zip} onChange={update("shipping_zip")} className="rounded-none h-12" />
            </div>
            <Input required placeholder="Country" value={form.shipping_country} onChange={update("shipping_country")} className="rounded-none h-12" />
            {selectedZone?.estimated_days && (
              <p className="text-xs text-muted-foreground">Estimated delivery: {selectedZone.estimated_days}</p>
            )}
          </section>

          <section className="space-y-3">
            <p className="text-xs tracking-luxe uppercase">Payment Method</p>
            <RadioGroup value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v as any, payment_reference: "" })} className="space-y-2">
              {settings?.enable_cod && (
                <label className="flex items-start gap-3 border p-4 cursor-pointer hover:bg-secondary">
                  <RadioGroupItem value="cod" className="mt-1" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay in cash when your order arrives.{codFee > 0 ? ` (+${fmt(codFee)} fee)` : ""}</p>
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
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs">Transaction ID / Reference</Label>
                  <Input required placeholder="Enter TID after sending payment" value={form.payment_reference} onChange={update("payment_reference")} className="rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Upload payment receipt (optional)</Label>
                  <label className="flex items-center gap-3 border border-dashed p-4 cursor-pointer hover:bg-secondary">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground flex-1">
                      {receiptFile ? receiptFile.name : "Choose screenshot or photo of payment"}
                    </span>
                    <input type="file" accept="image/*,application/pdf" className="hidden"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
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
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping {selectedZone ? `(${selectedZone.city})` : ""}</span><span>{shipping === 0 ? (items.length ? "Free" : "—") : fmt(shipping)}</span></div>
            {codFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">COD fee</span><span>{fmt(codFee)}</span></div>}
            <div className="flex justify-between text-base pt-2 border-t mt-2"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
        </aside>
      </div>
    </StoreLayout>
  );
};

export default Checkout;
