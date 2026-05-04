import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="bg-ink text-cream mt-24">
    <div className="container py-20 grid md:grid-cols-4 gap-10">
      <div>
        <p className="font-serif text-2xl tracking-luxe">MAISON</p>
        <p className="text-xs text-cream/60 mt-4 leading-relaxed">A contemporary luxury house. Designed in Paris, crafted in Italy.</p>
      </div>
      {[
        { title: "Shop", links: [["Women","/shop/women"],["Men","/shop/men"],["Accessories","/shop/accessories"],["Footwear","/shop/footwear"]] },
        { title: "House", links: [["Our Story","/"],["Ateliers","/"],["Sustainability","/"],["Press","/"]] },
        { title: "Client Services", links: [["Contact","/"],["Shipping","/"],["Returns","/"],["Care Guide","/"]] },
      ].map(col => (
        <div key={col.title}>
          <p className="text-xs uppercase tracking-luxe mb-4">{col.title}</p>
          <ul className="space-y-2 text-sm text-cream/70">
            {col.links.map(([l,u]) => <li key={l}><Link to={u} className="hover:text-gold transition-colors">{l}</Link></li>)}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-cream/10 py-6 text-center text-xs text-cream/40 tracking-wider-2 uppercase">
      © {new Date().getFullYear()} Maison — All rights reserved
    </div>
  </footer>
);
