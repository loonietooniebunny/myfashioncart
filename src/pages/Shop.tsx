import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { ProductCard, ProductCardData } from "@/components/storefront/ProductCard";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";

const TITLES: Record<string, { title: string; sub: string; img: string }> = {
  women: { title: "Women", sub: "Spring · Summer 2026", img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=2000&q=80" },
  men: { title: "Men", sub: "The Tailoring Edit", img: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=2000&q=80" },
  accessories: { title: "Accessories", sub: "Defining Details", img: "https://images.unsplash.com/photo-1591348122449-02525d70379b?w=2000&q=80" },
  footwear: { title: "Footwear", sub: "Crafted in Italy", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=2000&q=80" },
  all: { title: "All", sub: "The full collection", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2000&q=80" },
};

type RawProduct = ProductCardData & { stock: number; sizes: string[]; created_at: string };

const Shop = () => {
  const { slug = "women" } = useParams();
  const meta = TITLES[slug] ?? TITLES.women;
  const [products, setProducts] = useState<RawProduct[]>([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sizesFilter, setSizesFilter] = useState<Set<string>>(new Set());
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      let query = supabase.from("products")
        .select("id,name,slug,price,compare_at_price,images,stock,sizes,created_at")
        .eq("is_active", true);
      if (slug !== "all") {
        const { data: cat } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
        if (!cat) { setProducts([]); return; }
        query = query.eq("category_id", cat.id);
      }
      const { data } = await query.order("created_at", { ascending: false });
      const list = (data ?? []) as RawProduct[];
      setProducts(list);
      const maxP = Math.max(1000, ...list.map(p => Number(p.price)));
      setMaxPrice(maxP);
      setPriceRange([0, maxP]);

      // batch ratings
      if (list.length > 0) {
        const ids = list.map(p => p.id);
        const { data: rev } = await supabase.from("reviews").select("product_id,rating").eq("is_approved", true).in("product_id", ids);
        const map = new Map<string, { sum: number; n: number }>();
        (rev ?? []).forEach((r: any) => {
          const e = map.get(r.product_id) ?? { sum: 0, n: 0 };
          e.sum += r.rating; e.n += 1; map.set(r.product_id, e);
        });
        setProducts(list.map(p => {
          const e = map.get(p.id);
          return e ? { ...p, avg_rating: e.sum / e.n, review_count: e.n } : p;
        }));
      }
    })();
  }, [slug]);

  const allSizes = useMemo(() => Array.from(new Set(products.flatMap(p => p.sizes))).sort(), [products]);

  const filtered = useMemo(() => {
    let f = products.filter(p => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]);
    if (inStock) f = f.filter(p => p.stock > 0);
    if (onSale) f = f.filter(p => p.compare_at_price && Number(p.compare_at_price) > Number(p.price));
    if (sizesFilter.size > 0) f = f.filter(p => p.sizes.some(s => sizesFilter.has(s)));
    switch (sort) {
      case "price-asc": f = [...f].sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price-desc": f = [...f].sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "rating": f = [...f].sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0)); break;
      default: break;
    }
    return f;
  }, [products, priceRange, sizesFilter, inStock, onSale, sort]);

  const toggleSize = (s: string) => {
    const next = new Set(sizesFilter);
    next.has(s) ? next.delete(s) : next.add(s);
    setSizesFilter(next);
  };

  const reset = () => {
    setPriceRange([0, maxPrice]); setSizesFilter(new Set()); setInStock(false); setOnSale(false); setSort("newest");
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-xs uppercase tracking-wider">Sort by</Label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="rating">Top rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs uppercase tracking-wider">Price: Rs {priceRange[0].toLocaleString()} – Rs {priceRange[1].toLocaleString()}</Label>
        <Slider min={0} max={maxPrice} step={50} value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} className="mt-3" />
      </div>

      {allSizes.length > 0 && (
        <div>
          <Label className="text-xs uppercase tracking-wider">Size</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {allSizes.map(s => (
              <button key={s} onClick={() => toggleSize(s)}
                className={`min-w-10 h-9 px-3 border text-sm transition-colors ${sizesFilter.has(s) ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between"><Label>In stock only</Label><Switch checked={inStock} onCheckedChange={setInStock} /></div>
        <div className="flex items-center justify-between"><Label>On sale</Label><Switch checked={onSale} onCheckedChange={setOnSale} /></div>
      </div>

      <Button variant="outline" size="sm" onClick={reset} className="w-full">Reset filters</Button>
    </div>
  );

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

      <section className="container py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-muted-foreground">{filtered.length} piece{filtered.length === 1 ? "" : "s"}</p>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(v => !v)} className="lg:hidden">
            {showFilters ? <X className="h-4 w-4 mr-2" /> : <SlidersHorizontal className="h-4 w-4 mr-2" />}
            Filters
          </Button>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-10">
          <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <FilterPanel />
          </aside>

          <div>
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No pieces match your filters.</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-14">
                {filtered.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </StoreLayout>
  );
};

export default Shop;
