import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, X, Menu, Heart, Shield, Sun, Moon } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const NAV = [
  { to: "/shop/women", label: "Women" },
  { to: "/shop/men", label: "Men" },
  { to: "/shop/accessories", label: "Accessories" },
  { to: "/shop/footwear", label: "Footwear" },
];

export const Navbar = () => {
  const { count, setOpen } = useCart();
  const { isAdmin } = useAuth();
  const { settings } = useSiteSettings();
  const { theme, toggle: toggleTheme } = useTheme();
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

  const siteName = settings?.site_name || "MAISON";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/95 backdrop-blur border-b border-border" : "bg-background/95 lg:bg-background/70 backdrop-blur-sm border-b border-border/60 lg:border-b-0"}`}>
        <div className="container px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16 lg:h-20">
          {/* Left: mobile menu + desktop nav */}
          <div className="flex items-center gap-6 w-10 lg:w-auto lg:flex-1 min-w-0">
            <button className="lg:hidden hover:text-accent shrink-0" aria-label="Menu" onClick={() => setMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <nav className="hidden lg:flex items-center gap-6 text-xs tracking-wider-2 uppercase">
              {NAV.map(n => (
                <NavLink key={n.to} to={n.to} className={({isActive}) => `hover:text-accent transition-colors ${isActive ? "text-accent" : ""}`}>{n.label}</NavLink>
              ))}
            </nav>
          </div>

          {/* Center: logo */}
          <Link to="/" className="font-serif text-base sm:text-xl md:text-2xl lg:text-3xl tracking-wider-2 lg:tracking-luxe text-center flex items-center gap-2 shrink min-w-0 max-w-[38vw] sm:max-w-none">
            {settings?.logo_url && <img src={settings.logo_url} alt={siteName} className="h-7 w-auto object-contain" />}
            <span className="truncate">{siteName.toUpperCase()}</span>
          </Link>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 w-auto lg:flex-1 justify-end min-w-0">
            <button aria-label="Search" onClick={() => setSearchOpen(true)} className="inline-flex h-8 w-8 items-center justify-center hover:text-accent transition-colors">
              <Search className="h-4 w-4" />
            </button>
            <button aria-label="Toggle theme" onClick={toggleTheme} className="inline-flex h-8 w-8 items-center justify-center hover:text-accent transition-colors">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link to="/account?tab=wishlist" aria-label="Wishlist" className="hidden sm:inline-flex hover:text-accent transition-colors">
              <Heart className="h-4 w-4" />
            </Link>
            {isAdmin && (
              <Link to="/admin" aria-label="Admin panel" title="Admin panel" className="inline-flex h-8 min-w-8 items-center justify-center gap-1 px-2 rounded-sm bg-accent text-accent-foreground hover:opacity-90 transition-opacity shrink-0">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline text-[10px] tracking-wider-2 uppercase font-medium">Admin</span>
              </Link>
            )}
            <Link to="/account" aria-label="Account" className="inline-flex h-8 w-8 items-center justify-center hover:text-accent transition-colors">
              <User className="h-4 w-4" />
            </Link>
            <button aria-label="Cart" onClick={() => setOpen(true)} className="relative inline-flex h-8 w-8 items-center justify-center hover:text-accent transition-colors">
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-2 -right-3 text-[10px] bg-foreground text-background rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{count}</span>
              )}
            </button>
          </div>
        </div>
      </header>

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

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-background lg:hidden animate-in fade-in duration-200">
          <div className="flex justify-end p-6">
            <button onClick={() => setMenuOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex flex-col items-center gap-8 pt-12 font-serif text-3xl">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} onClick={() => setMenuOpen(false)}>{n.label}</NavLink>
            ))}
            <Link to="/account?tab=wishlist" onClick={() => setMenuOpen(false)} className="text-base tracking-luxe uppercase mt-8">Wishlist</Link>
            <Link to="/account" onClick={() => setMenuOpen(false)} className="text-base tracking-luxe uppercase">Account</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 text-base tracking-luxe uppercase text-accent"><Shield className="h-4 w-4" /> Admin Panel</Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
};
