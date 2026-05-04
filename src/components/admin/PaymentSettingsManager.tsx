import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const PaymentSettingsManager = () => {
  const [s, setS] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (supabase as any).from("payment_settings").select("*").limit(1).maybeSingle()
      .then(({ data }: any) => setS(data));
  }, []);

  if (!s) return <p className="text-muted-foreground text-sm">Loading…</p>;

  const set = (k: string, v: any) => setS({ ...s, [k]: v });

  const save = async () => {
    setBusy(true);
    const { id, updated_at, ...rest } = s;
    const { error } = await (supabase as any).from("payment_settings").update(rest).eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Payment settings saved");
  };

  const Toggle = ({ k, label }: { k: string; label: string }) => (
    <label className="flex items-center justify-between border p-3 rounded">
      <span>{label}</span>
      <Switch checked={!!s[k]} onCheckedChange={(v) => set(k, v)} />
    </label>
  );

  const Field = ({ k, label, type = "text" }: { k: string; label: string; type?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={s[k] ?? ""} onChange={(e) => set(k, type === "number" ? Number(e.target.value) : e.target.value)} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <section className="space-y-3">
        <h3 className="font-semibold">Enabled methods</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          <Toggle k="enable_cod" label="Cash on Delivery" />
          <Toggle k="enable_easypaisa" label="EasyPaisa" />
          <Toggle k="enable_jazzcash" label="JazzCash" />
          <Toggle k="enable_card" label="Bank Transfer / Card" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Fees & shipping</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field k="currency" label="Currency" />
          <Field k="shipping_fee" label="Shipping fee" type="number" />
          <Field k="free_shipping_threshold" label="Free shipping over" type="number" />
          <Field k="cod_fee" label="COD fee" type="number" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">EasyPaisa</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field k="easypaisa_account" label="Account number" />
          <Field k="easypaisa_name" label="Account title" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">JazzCash</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field k="jazzcash_account" label="Account number" />
          <Field k="jazzcash_name" label="Account title" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Bank</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field k="bank_name" label="Bank name" />
          <Field k="bank_account_title" label="Account title" />
          <Field k="bank_account_number" label="Account number" />
          <Field k="bank_iban" label="IBAN" />
        </div>
      </section>

      <section className="space-y-2">
        <Label className="text-xs">Customer instructions</Label>
        <Textarea value={s.instructions ?? ""} onChange={(e) => set("instructions", e.target.value)} rows={3} />
      </section>

      <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</Button>
    </div>
  );
};
