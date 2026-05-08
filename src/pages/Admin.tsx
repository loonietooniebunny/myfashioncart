import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { OrdersManager } from "@/components/admin/OrdersManager";
import { PaymentSettingsManager } from "@/components/admin/PaymentSettingsManager";
import { ShippingZonesManager } from "@/components/admin/ShippingZonesManager";
import { SiteSettingsManager } from "@/components/admin/SiteSettingsManager";
import { LogOut, Home } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth?next=/admin" replace />;
  if (!isAdmin) return <Navigate to="/account" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-14">
          <h1 className="font-semibold">Store Admin</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link to="/"><Home className="h-4 w-4 mr-2" />Store</Link></Button>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <Tabs defaultValue="orders">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="site">Site Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-4"><OrdersManager /></TabsContent>
            <TabsContent value="products" className="mt-4"><ProductsManager /></TabsContent>
            <TabsContent value="categories" className="mt-4"><CategoriesManager /></TabsContent>
            <TabsContent value="payments" className="mt-4"><PaymentSettingsManager /></TabsContent>
            <TabsContent value="shipping" className="mt-4"><ShippingZonesManager /></TabsContent>
            <TabsContent value="site" className="mt-4"><SiteSettingsManager /></TabsContent>
          </Tabs>
      </main>
    </div>
  );
};

export default Admin;
