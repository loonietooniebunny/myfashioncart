import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const SiteSettingsManager = () => {
  const { reload } = useSiteSettings();
  const [s, setS] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (supabase as any).from("site_settings").select("*").limit(1).maybeSingle()
      .then(({ data }: any) => setS(data));
  }, []);

  if (!s) return <p className="text-muted-foreground text-sm">Loading…</p>;

  const set = (k: string, v: any) => setS({ ...s, [k]: v });

  const upload = async (key: string, file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    const path = `site/${key}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { setBusy(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    set(key, data.publicUrl);
    setBusy(false);
  };

  const save = async () => {
    setBusy(true);
    const { id, updated_at, ...rest } = s;
    const { error } = await (supabase as any).from("site_settings").update(rest).eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Site settings saved");
    reload();
  };

  const Field = ({ k, label, type = "text" }: { k: string; label: string; type?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={s[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
    </div>
  );

  const ImageField = ({ k, label }: { k: string; label: string }) => (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-3">
        {s[k] && <img src={s[k]} className="h-16 w-16 object-cover rounded border" alt="" />}
        <label className="inline-flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-muted text-sm">
          <Upload className="h-4 w-4" />Upload
          <input type="file" accept="image/*" className="hidden" onChange={e => upload(k, e.target.files?.[0])} />
        </label>
        {s[k] && <Button variant="ghost" size="sm" onClick={() => set(k, "")}>Remove</Button>}
      </div>
      <Input value={s[k] ?? ""} onChange={e => set(k, e.target.value)} placeholder="…or paste a URL" className="text-xs" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <section className="space-y-3">
        <h3 className="font-semibold">Branding</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field k="site_name" label="Site name" />
          <Field k="theme_primary_hsl" label="Primary color (HSL e.g. 222 47% 11%)" />
        </div>
        <ImageField k="logo_url" label="Logo" />
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Hero (homepage)</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field k="hero_title" label="Hero title" />
          <Field k="hero_subtitle" label="Hero subtitle" />
          <Field k="hero_cta_text" label="CTA button text" />
          <Field k="hero_cta_link" label="CTA link" />
        </div>
        <ImageField k="hero_image_url" label="Hero background image" />
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">Footer & contact</h3>
        <div className="space-y-1">
          <Label className="text-xs">Footer text</Label>
          <Textarea value={s.footer_text ?? ""} onChange={e => set("footer_text", e.target.value)} rows={2} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field k="contact_email" label="Contact email" />
          <Field k="contact_phone" label="Contact phone" />
          <Field k="social_instagram" label="Instagram URL" />
          <Field k="social_facebook" label="Facebook URL" />
          <Field k="social_twitter" label="Twitter / X URL" />
        </div>
      </section>

      <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</Button>
    </div>
  );
};
