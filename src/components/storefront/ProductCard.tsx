import { Link } from "react-router-dom";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
};

export const ProductCard = ({ p }: { p: ProductCardData }) => (
  <Link to={`/product/${p.slug}`} className="group block">
    <div className="img-zoom aspect-[3/4] bg-stone overflow-hidden relative">
      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
      {p.images[1] && (
        <img src={p.images[1]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700" loading="lazy" />
      )}
    </div>
    <div className="pt-4 text-center">
      <h3 className="font-serif text-lg">{p.name}</h3>
      <div className="flex items-center justify-center gap-2 text-sm mt-1">
        <span>${Number(p.price).toLocaleString()}</span>
        {p.compare_at_price && <span className="text-muted-foreground line-through text-xs">${Number(p.compare_at_price).toLocaleString()}</span>}
      </div>
    </div>
  </Link>
);
