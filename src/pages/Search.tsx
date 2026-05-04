import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { ProductCard, ProductCardData } from "@/components/storefront/ProductCard";

const Search = () => {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.from("products")
      .select("id,name,slug,price,compare_at_price,images")
      .eq("is_active", true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(60)
      .then(({ data }) => { setProducts((data ?? []) as ProductCardData[]); setLoading(false); });
  }, [q]);

  return (
    <StoreLayout>
      <section className="container py-16 md:py-24">
        <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-3">Search</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Results for "{q}"</h1>
        {loading ? (
          <p className="text-muted-foreground">Searching…</p>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">No pieces matched your search.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
            {products.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </StoreLayout>
  );
};

export default Search;
