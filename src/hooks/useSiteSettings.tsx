import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: string;
  site_name: string;
  logo_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_cta_text: string | null;
  hero_cta_link: string | null;
  footer_text: string | null;
  theme_primary_hsl: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
};

const Ctx = createContext<{ settings: SiteSettings | null; reload: () => void }>({
  settings: null, reload: () => {},
});

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const load = () => {
    (supabase as any).from("site_settings").select("*").limit(1).maybeSingle()
      .then(({ data }: any) => {
        setSettings(data);
        if (data?.theme_primary_hsl) {
          document.documentElement.style.setProperty("--primary", data.theme_primary_hsl);
        }
        if (data?.site_name) document.title = data.site_name;
      });
  };

  useEffect(() => { load(); }, []);

  return <Ctx.Provider value={{ settings, reload: load }}>{children}</Ctx.Provider>;
};

export const useSiteSettings = () => useContext(Ctx);
