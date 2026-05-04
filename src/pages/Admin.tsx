import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { OrdersManager } from "@/components/admin/OrdersManager";
import { PaymentSettingsManager } from "@/components/admin/PaymentSettingsManager";
import { LogOut, Home } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

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
        {!isAdmin ? (
          <div className="max-w-xl mx-auto text-center space-y-3 py-16">
            <h2 className="text-2xl font-semibold">Admin access required</h2>
            <p className="text-muted-foreground">
              Your account ({user.email}) doesn't have the admin role yet. Open the backend, go to the <code>user_roles</code> table, and add a row with your user id and role <code>admin</code>.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-4"><OrdersManager /></TabsContent>
            <TabsContent value="products" className="mt-4"><ProductsManager /></TabsContent>
            <TabsContent value="categories" className="mt-4"><CategoriesManager /></TabsContent>
            <TabsContent value="payments" className="mt-4"><PaymentSettingsManager /></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Admin;
