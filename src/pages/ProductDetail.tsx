import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Minus, Plus, Heart, Share2 } from "lucide-react";
import { Reviews } from "@/components/storefront/Reviews";
import { useWishlist } from "@/hooks/useWishlist";

type Product = {
  id: string; name: string; slug: string; description: string | null;
  price: number; compare_at_price: number | null;
  sizes: string[]; images: string[]; stock: number;
};

const ProductDetail = () => {
  const { slug } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const { add } = useCart();

  useEffect(() => {
    if (!slug) return;
    supabase.from("products").select("*").eq("slug", slug).eq("is_active", true).maybeSingle()
      .then(({ data }) => { setP(data as Product); setImgIdx(0); setSize(data?.sizes?.[0] ?? ""); });
  }, [slug]);

  if (!p) return <StoreLayout><div className="container py-32 text-center text-muted-foreground">Loading…</div></StoreLayout>;

  const handleAdd = () => {
    if (!size) { toast.error("Please select a size"); return; }
    add({ productId: p.id, name: p.name, price: Number(p.price), image: p.images[0] ?? "", size }, qty);
  };

  return (
    <StoreLayout>
      <div className="container py-10 md:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div className="grid grid-cols-1 gap-2">
          <div className="img-zoom aspect-[3/4] bg-stone">
            <img src={p.images[imgIdx]} alt={p.name} className="w-full h-full object-cover" />
          </div>
          {p.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {p.images.map((src, i) => (
                <button key={src} onClick={() => setImgIdx(i)} className={`aspect-square overflow-hidden border ${i === imgIdx ? "border-foreground" : "border-transparent"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:sticky lg:top-28 lg:self-start space-y-6">
          <p className="text-xs tracking-luxe uppercase text-muted-foreground">MAISON</p>
          <h1 className="font-serif text-4xl md:text-5xl">{p.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xl">${Number(p.price).toLocaleString()}</span>
            {p.compare_at_price && <span className="text-muted-foreground line-through text-sm">${Number(p.compare_at_price).toLocaleString()}</span>}
          </div>
          {p.description && <p className="text-muted-foreground leading-relaxed">{p.description}</p>}

          {p.sizes.length > 0 && (
            <div>
              <p className="text-xs tracking-luxe uppercase mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`min-w-12 h-11 px-4 border text-sm transition-colors ${size === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs tracking-luxe uppercase mb-3">Quantity</p>
            <div className="inline-flex items-center border border-border">
              <button className="px-3 py-2" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus className="h-3 w-3" /></button>
              <span className="px-4 text-sm">{qty}</span>
              <button className="px-3 py-2" onClick={() => setQty(q => q + 1)}><Plus className="h-3 w-3" /></button>
            </div>
          </div>

          <Button onClick={handleAdd} className="w-full rounded-none h-12 tracking-wider-2 text-xs uppercase">
            Add to Bag
          </Button>

          <div className="border-t border-border pt-6 space-y-3 text-xs text-muted-foreground">
            <p>Complimentary shipping on orders over $500</p>
            <p>Free returns within 30 days</p>
            <p>Crafted in Italy</p>
          </div>

          <Link to="/" className="inline-block text-xs tracking-luxe uppercase underline underline-offset-4">← Continue browsing</Link>
        </div>
      </div>
    </StoreLayout>
  );
};

export default ProductDetail;
