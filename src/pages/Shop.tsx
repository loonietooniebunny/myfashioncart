import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { ProductCard, ProductCardData } from "@/components/storefront/ProductCard";

const TITLES: Record<string, { title: string; sub: string; img: string }> = {
  women: { title: "Women", sub: "Spring · Summer 2026", img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=2000&q=80" },
  men: { title: "Men", sub: "The Tailoring Edit", img: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=2000&q=80" },
  accessories: { title: "Accessories", sub: "Defining Details", img: "https://images.unsplash.com/photo-1591348122449-02525d70379b?w=2000&q=80" },
  footwear: { title: "Footwear", sub: "Crafted in Italy", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=2000&q=80" },
};

const Shop = () => {
  const { slug = "women" } = useParams();
  const meta = TITLES[slug] ?? TITLES.women;
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
      if (!cat) { setProducts([]); return; }
      const { data } = await supabase.from("products")
        .select("id,name,slug,price,compare_at_price,images")
        .eq("category_id", cat.id).eq("is_active", true)
        .order("created_at", { ascending: false });
      setProducts((data ?? []) as ProductCardData[]);
    })();
  }, [slug]);

  return (
    <StoreLayout transparentNav>
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <img src={meta.img} alt={meta.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/30" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-cream text-center fade-up">
          <p className="text-xs tracking-luxe uppercase mb-4 opacity-80">{meta.sub}</p>
          <h1 className="font-serif text-5xl md:text-7xl">{meta.title}</h1>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">No pieces in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-14">
            {products.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </StoreLayout>
  );
};

export default Shop;
