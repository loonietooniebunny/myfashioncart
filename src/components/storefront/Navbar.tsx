import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, Search, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/90 backdrop-blur border-b border-border" : "bg-transparent"}`}>
      <div className="container flex items-center justify-between h-16 md:h-20">
        <nav className="hidden md:flex items-center gap-8 text-xs tracking-wider-2 uppercase flex-1">
          <NavLink to="/shop/women" className={({isActive}) => `hover:text-accent transition-colors ${isActive ? "text-accent" : ""}`}>Women</NavLink>
          <NavLink to="/shop/men" className={({isActive}) => `hover:text-accent transition-colors ${isActive ? "text-accent" : ""}`}>Men</NavLink>
          <NavLink to="/shop/accessories" className={({isActive}) => `hover:text-accent transition-colors ${isActive ? "text-accent" : ""}`}>Accessories</NavLink>
          <NavLink to="/shop/footwear" className={({isActive}) => `hover:text-accent transition-colors ${isActive ? "text-accent" : ""}`}>Footwear</NavLink>
        </nav>
        <Link to="/" className="font-serif text-2xl md:text-3xl tracking-luxe absolute left-1/2 -translate-x-1/2">
          MAISON
        </Link>
        <div className="flex items-center gap-4 md:gap-5 flex-1 justify-end">
          <button aria-label="Search" className="hover:text-accent transition-colors"><Search className="h-4 w-4" /></button>
          <Link to="/admin" aria-label="Account" className="hover:text-accent transition-colors"><User className="h-4 w-4" /></Link>
          <button aria-label="Cart" onClick={() => setOpen(true)} className="relative hover:text-accent transition-colors">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-2 -right-3 text-[10px] bg-foreground text-background rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{count}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
