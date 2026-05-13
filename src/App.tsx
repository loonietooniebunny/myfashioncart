import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { SiteSettingsProvider } from "@/hooks/useSiteSettings";
import Home from "./pages/Home.tsx";
import Shop from "./pages/Shop.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Checkout from "./pages/Checkout.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import Search from "./pages/Search.tsx";
import Account from "./pages/Account.tsx";
import OrderStatus from "./pages/OrderStatus.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SiteSettingsProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop/:slug" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin/*" element={<Admin />} />
                <Route path="/account" element={<Account />} />
                <Route path="/order/:id" element={<OrderStatus />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
