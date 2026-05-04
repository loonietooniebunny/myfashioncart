import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { ProductCard, ProductCardData } from "@/components/storefront/ProductCard";
import { useReveal } from "@/hooks/useReveal";
import { Button } from "@/components/ui/button";

const HERO = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2000&q=80";
const EDITORIAL_1 = "https://images.unsplash.com/photo-1487744480471-9ca1bca6fb7d?w=1600&q=80";
const EDITORIAL_2 = "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=1600&q=80";

const Home = () => {
  const [featured, setFeatured] = useState<ProductCardData[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const r1 = useReveal<HTMLDivElement>();
  const r2 = useReveal<HTMLDivElement>();
  const r3 = useReveal<HTMLDivElement>();
  const r4 = useReveal<HTMLDivElement>();

  useEffect(() => {
    supabase.from("products").select("id,name,slug,price,compare_at_price,images")
      .eq("is_featured", true).eq("is_active", true).limit(8)
      .then(({ data }) => setFeatured((data ?? []) as ProductCardData[]));
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <StoreLayout transparentNav>
      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        <div
          className="absolute inset-0 parallax-slow"
          style={{ transform: `translateY(${scrollY * 0.4}px) scale(1.05)` }}
        >
          <img src={HERO} alt="" className="w-full h-[120%] object-cover" />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-24 text-cream text-center fade-up">
          <p className="text-xs tracking-luxe uppercase mb-6 text-cream/80">Spring · Summer 2026</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-balance max-w-4xl px-6">
            The Art of Quiet Luxury
          </h1>
          <p className="mt-6 max-w-md px-6 text-cream/80 text-sm leading-relaxed">
            A new chapter — sculpted silhouettes, hand-finished in our Italian ateliers.
          </p>
          <Button asChild className="mt-10 rounded-none bg-cream text-ink hover:bg-cream/90 h-12 px-10 text-xs tracking-luxe uppercase">
            <Link to="/shop/women">Discover the Collection</Link>
          </Button>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-cream/70 text-[10px] tracking-luxe uppercase animate-pulse">Scroll</div>
      </section>

      {/* INTRO */}
      <section ref={r1} className="reveal container py-24 md:py-32 text-center max-w-2xl">
        <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-6">The House</p>
        <h2 className="font-serif text-4xl md:text-5xl text-balance">
          Crafted in Italy. Worn everywhere that matters.
        </h2>
        <p className="mt-8 text-muted-foreground leading-relaxed">
          Founded on the belief that true luxury is restraint, MAISON brings together the finest mills and ateliers
          across Florence, Como and Veneto to create pieces destined to outlive trends.
        </p>
      </section>

      {/* CATEGORY SPLIT */}
      <section ref={r2} className="reveal grid md:grid-cols-2 gap-1">
        {[
          { label: "Women", to: "/shop/women", img: EDITORIAL_1 },
          { label: "Men", to: "/shop/men", img: EDITORIAL_2 },
        ].map(c => (
          <Link key={c.label} to={c.to} className="img-zoom relative aspect-[4/5] md:aspect-[3/4] overflow-hidden block group">
            <img src={c.img} alt={c.label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-10 text-center text-cream">
              <p className="font-serif text-3xl md:text-4xl">{c.label}</p>
              <p className="text-xs tracking-luxe uppercase mt-3 opacity-80 group-hover:opacity-100 transition-opacity">Shop the collection →</p>
            </div>
          </Link>
        ))}
      </section>

      {/* FEATURED */}
      <section ref={r3} className="reveal container py-24 md:py-32">
        <div className="text-center mb-14">
          <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-4">Editor's Choice</p>
          <h2 className="font-serif text-4xl md:text-5xl">Featured Pieces</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
          {featured.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-border py-6 overflow-hidden bg-secondary">
        <div className="marquee whitespace-nowrap font-serif text-3xl md:text-5xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-16 shrink-0">
              {["Florence", "Paris", "Milan", "Como", "Veneto", "New York", "Tokyo"].map(c => (
                <span key={c} className="opacity-70">— {c}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* JOURNAL */}
      <section ref={r4} className="reveal container py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div className="img-zoom aspect-[4/5]">
          <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-4">The Journal</p>
          <h2 className="font-serif text-4xl md:text-5xl text-balance">A Season Without Noise</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Behind the new collection: an obsession with proportion, the return of the slip dress, and why
            quiet, unembellished tailoring is the most subversive thing in fashion right now.
          </p>
          <Link to="/shop/women" className="inline-block mt-8 text-xs tracking-luxe uppercase border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors">
            Read the story
          </Link>
        </div>
      </section>
    </StoreLayout>
  );
};

export default Home;
