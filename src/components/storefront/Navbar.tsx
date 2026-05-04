import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, X, Menu } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

const NAV = [
  { to: "/shop/women", label: "Women" },
  { to: "/shop/men", label: "Men" },
  { to: "/shop/accessories", label: "Accessories" },
  { to: "/shop/footwear", label: "Footwear" },
];

export const Navbar = () => {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    nav(`/search?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
    setQ("");
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/95 backdrop-blur border-b border-border" : "bg-transparent"}`}>
        <div className="container grid grid-cols-3 items-center h-16 md:h-20">
          {/* Left: nav (desktop) / menu (mobile) */}
          <nav className="hidden md:flex items-center gap-7 text-xs tracking-wider-2 uppercase">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} className={({isActive}) => `hover:text-accent transition-colors ${isActive ? "text-accent" : ""}`}>{n.label}</NavLink>
            ))}
          </nav>
          <button className="md:hidden justify-self-start hover:text-accent" aria-label="Menu" onClick={() => setMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          {/* Center: logo */}
          <Link to="/" className="font-serif text-2xl md:text-3xl tracking-luxe text-center justify-self-center">
            MAISON
          </Link>

          {/* Right: actions */}
          <div className="flex items-center gap-5 justify-self-end">
            <button aria-label="Search" onClick={() => setSearchOpen(true)} className="hover:text-accent transition-colors">
              <Search className="h-4 w-4" />
            </button>
            <Link to="/account" aria-label="Account" className="hidden sm:inline-flex hover:text-accent transition-colors">
              <User className="h-4 w-4" />
            </Link>
            <button aria-label="Cart" onClick={() => setOpen(true)} className="relative hover:text-accent transition-colors">
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-2 -right-3 text-[10px] bg-foreground text-background rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{count}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="container pt-24">
            <button className="absolute top-6 right-6 hover:text-accent" onClick={() => setSearchOpen(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={onSearch} className="max-w-2xl mx-auto">
              <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-4">Search the Maison</p>
              <div className="flex items-center gap-3 border-b-2 border-foreground pb-2">
                <Search className="h-5 w-5" />
                <Input
                  autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Search dresses, jackets, bags…"
                  className="border-0 shadow-none text-2xl md:text-3xl font-serif h-14 focus-visible:ring-0 px-0 bg-transparent"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4">Press Enter to search</p>
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-background md:hidden animate-in fade-in duration-200">
          <div className="flex justify-end p-6">
            <button onClick={() => setMenuOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex flex-col items-center gap-8 pt-12 font-serif text-3xl">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} onClick={() => setMenuOpen(false)}>{n.label}</NavLink>
            ))}
            <Link to="/account" onClick={() => setMenuOpen(false)} className="text-base tracking-luxe uppercase mt-8">Account</Link>
          </nav>
        </div>
      )}
    </>
  );
};
