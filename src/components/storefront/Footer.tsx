import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react";

export const Footer = () => {
  const { settings } = useSiteSettings();
  const siteName = (settings?.site_name || "MAISON").toUpperCase();
  return (
    <footer className="bg-ink text-cream mt-24">
      <div className="container py-20 grid md:grid-cols-4 gap-10">
        <div>
          <p className="font-serif text-2xl tracking-luxe">{siteName}</p>
          <p className="text-xs text-cream/60 mt-4 leading-relaxed">A contemporary luxury house. Designed in Paris, crafted in Italy.</p>
          <div className="flex gap-4 mt-5">
            {settings?.social_instagram && <a href={settings.social_instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-gold"><Instagram className="h-4 w-4" /></a>}
            {settings?.social_facebook && <a href={settings.social_facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-gold"><Facebook className="h-4 w-4" /></a>}
            {settings?.social_twitter && <a href={settings.social_twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-gold"><Twitter className="h-4 w-4" /></a>}
          </div>
        </div>
        {[
          { title: "Shop", links: [["Women","/shop/women"],["Men","/shop/men"],["Accessories","/shop/accessories"],["Footwear","/shop/footwear"]] as [string,string][] },
          { title: "House", links: [["Our Story","/"],["Ateliers","/"],["Sustainability","/"],["Press","/"]] as [string,string][] },
        ].map(col => (
          <div key={col.title}>
            <p className="text-xs uppercase tracking-luxe mb-4">{col.title}</p>
            <ul className="space-y-2 text-sm text-cream/70">
              {col.links.map(([l,u]) => <li key={l}><Link to={u} className="hover:text-gold transition-colors">{l}</Link></li>)}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-xs uppercase tracking-luxe mb-4">Contact</p>
          <ul className="space-y-2 text-sm text-cream/70">
            {settings?.contact_email && <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> {settings.contact_email}</li>}
            {settings?.contact_phone && <li className="flex items-center gap-2"><Phone className="h-3 w-3" /> {settings.contact_phone}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-6 text-center text-xs text-cream/40 tracking-wider-2 uppercase">
        {settings?.footer_text || `© ${new Date().getFullYear()} ${siteName} — All rights reserved`}
      </div>
    </footer>
  );
};
