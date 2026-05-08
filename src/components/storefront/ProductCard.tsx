import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, Heart } from "lucide-react";
import { QuickView } from "./QuickView";
import { useWishlist } from "@/hooks/useWishlist";
import { StarRating } from "./StarRating";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  avg_rating?: number;
  review_count?: number;
};

export const ProductCard = ({ p }: { p: ProductCardData }) => {
  const [qv, setQv] = useState(false);
  const { has, toggle } = useWishlist();
  const discount = p.compare_at_price && p.compare_at_price > p.price
    ? Math.round((1 - Number(p.price) / Number(p.compare_at_price)) * 100) : 0;

  return (
    <>
      <div className="group block">
        <div className="img-zoom aspect-[3/4] bg-stone overflow-hidden relative">
          <Link to={`/product/${p.slug}`} className="block w-full h-full">
            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
            {p.images[1] && (
              <img src={p.images[1]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700" loading="lazy" />
            )}
          </Link>
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[10px] font-semibold px-2 py-1 rounded">-{discount}%</span>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.preventDefault(); toggle(p.id); }}
              className="bg-background/90 hover:bg-background rounded-full p-2 shadow"
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${has(p.id) ? "fill-destructive text-destructive" : ""}`} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setQv(true); }}
              className="bg-background/90 hover:bg-background rounded-full p-2 shadow"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setQv(true)}
            className="absolute bottom-0 left-0 right-0 bg-foreground text-background text-xs uppercase tracking-wider py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            Quick view
          </button>
        </div>
        <Link to={`/product/${p.slug}`} className="block pt-4 text-center">
          <h3 className="font-serif text-lg">{p.name}</h3>
          {p.review_count !== undefined && p.review_count > 0 && (
            <div className="flex justify-center mt-1"><StarRating value={p.avg_rating ?? 0} count={p.review_count} /></div>
          )}
          <div className="flex items-center justify-center gap-2 text-sm mt-1">
            {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) ? (
              <>
                <span className="font-semibold text-primary">Rs {Number(p.price).toLocaleString()}</span>
                <span className="text-muted-foreground line-through text-xs">Rs {Number(p.compare_at_price).toLocaleString()}</span>
              </>
            ) : (
              <span>Rs {Number(p.price).toLocaleString()}</span>
            )}
          </div>
        </Link>
      </div>
      <QuickView slug={qv ? p.slug : null} open={qv} onOpenChange={setQv} />
    </>
  );
};
