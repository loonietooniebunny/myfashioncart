import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Heart, Share2, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { StarRating } from "./StarRating";

type FullProduct = {
  id: string; name: string; slug: string; description: string | null;
  price: number; compare_at_price: number | null;
  sizes: string[]; images: string[]; stock: number;
};

export const QuickView = ({ slug, open, onOpenChange }: { slug: string | null; open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [p, setP] = useState<FullProduct | null>(null);
  const [size, setSize] = useState("");
  const [imgIdx, setImgIdx] = useState(0);
  const [rating, setRating] = useState({ avg: 0, count: 0 });
  const { add, setOpen: openCart } = useCart();
  const { has, toggle } = useWishlist();
  const nav = useNavigate();

  useEffect(() => {
    if (!slug || !open) return;
    setP(null); setImgIdx(0);
    supabase.from("products").select("*").eq("slug", slug).maybeSingle()
      .then(({ data }) => { setP(data as any); setSize((data as any)?.sizes?.[0] ?? ""); });
    supabase.from("reviews").select("rating").eq("is_approved", true)
      .eq("product_id", (slug as any)) // will refilter once we have product id
      .then(() => {});
  }, [slug, open]);

  useEffect(() => {
    if (!p) return;
    supabase.from("reviews").select("rating").eq("product_id", p.id).eq("is_approved", true)
      .then(({ data }) => {
        if (!data || data.length === 0) { setRating({ avg: 0, count: 0 }); return; }
        const avg = data.reduce((s: number, r: any) => s + r.rating, 0) / data.length;
        setRating({ avg, count: data.length });
      });
  }, [p?.id]);

  if (!p) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md"><div className="py-12 text-center text-muted-foreground">Loading…</div></DialogContent>
      </Dialog>
    );
  }

  const discount = p.compare_at_price && p.compare_at_price > p.price
    ? Math.round((1 - Number(p.price) / Number(p.compare_at_price)) * 100) : 0;

  const handleAdd = (buyNow = false) => {
    if (p.sizes.length > 0 && !size) { toast.error("Select a size"); return; }
    add({ productId: p.id, name: p.name, price: Number(p.price), image: p.images[0] ?? "", size }, 1);
    if (buyNow) { onOpenChange(false); nav("/checkout"); }
    else { onOpenChange(false); openCart(true); }
  };

  const share = async () => {
    const url = `${window.location.origin}/product/${p.slug}`;
    if (navigator.share) { try { await navigator.share({ title: p.name, url }); return; } catch {} }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-stone">
            <div className="aspect-[3/4] overflow-hidden">
              <img src={p.images[imgIdx]} alt={p.name} className="w-full h-full object-cover" />
            </div>
            {p.images.length > 1 && (
              <div className="grid grid-cols-5 gap-1 p-2">
                {p.images.slice(0, 5).map((src, i) => (
                  <button key={src} onClick={() => setImgIdx(i)} className={`aspect-square overflow-hidden border ${i === imgIdx ? "border-foreground" : "border-transparent"}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl">{p.name}</h2>
              {rating.count > 0 && <div className="mt-2"><StarRating value={rating.avg} count={rating.count} /></div>}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-semibold text-primary">Rs {Number(p.price).toLocaleString()}</span>
              {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                <>
                  <span className="text-muted-foreground line-through text-base">Rs {Number(p.compare_at_price).toLocaleString()}</span>
                  <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">-{discount}%</span>
                </>
              )}
            </div>

            {p.description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{p.description}</p>}

            {p.sizes.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {p.sizes.map(s => (
                    <button key={s} onClick={() => setSize(s)}
                      className={`min-w-10 h-9 px-3 border text-sm transition-colors ${size === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button onClick={() => handleAdd(false)} variant="outline" className="rounded-none h-11">
                <ShoppingBag className="h-4 w-4 mr-2" />Add to Cart
              </Button>
              <Button onClick={() => handleAdd(true)} className="rounded-none h-11">
                <Zap className="h-4 w-4 mr-2" />Buy Now
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => toggle(p.id)} className="flex-1">
                <Heart className={`h-4 w-4 mr-2 ${has(p.id) ? "fill-destructive text-destructive" : ""}`} />
                {has(p.id) ? "Saved" : "Wishlist"}
              </Button>
              <Button variant="ghost" size="sm" onClick={share} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />Share
              </Button>
            </div>

            <Link to={`/product/${p.slug}`} onClick={() => onOpenChange(false)} className="block text-xs text-center underline underline-offset-4 text-muted-foreground hover:text-foreground">
              View full details →
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
