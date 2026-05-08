import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LogOut, Home, Package, MapPin, User as UserIcon, Plus, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { ProductCard, ProductCardData } from "@/components/storefront/ProductCard";
import { useSearchParams } from "react-router-dom";

type Address = {
  id: string; user_id: string; label: string | null; full_name: string; phone: string;
  address: string; city: string; state: string | null; zip: string | null; country: string;
  is_default: boolean;
};

const emptyAddr = { label: "Home", full_name: "", phone: "", address: "", city: "", state: "", zip: "", country: "Pakistan", is_default: false };

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const [params] = useSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<ProductCardData[]>([]);
  const [newAddr, setNewAddr] = useState<any>(emptyAddr);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name ?? ""));
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
    (supabase as any).from("user_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false })
      .then(({ data }: any) => setAddresses(data ?? []));
    (async () => {
      const { data: w } = await (supabase as any).from("wishlists").select("product_id").eq("user_id", user.id);
      const ids = (w ?? []).map((r: any) => r.product_id);
      if (ids.length === 0) { setWishlist([]); return; }
      const { data: prods } = await supabase.from("products").select("id,name,slug,price,compare_at_price,images").in("id", ids).eq("is_active", true);
      setWishlist((prods ?? []) as ProductCardData[]);
    })();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  const saveProfile = async () => {
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  const addAddress = async () => {
    if (!newAddr.full_name || !newAddr.phone || !newAddr.address || !newAddr.city) {
      toast.error("Fill in name, phone, address and city"); return;
    }
    setBusy(true);
    const { data, error } = await (supabase as any).from("user_addresses")
      .insert({ ...newAddr, user_id: user.id }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setAddresses([data, ...addresses]);
    setNewAddr(emptyAddr);
    toast.success("Address added");
  };

  const deleteAddress = async (id: string) => {
    const { error } = await (supabase as any).from("user_addresses").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const setDefault = async (id: string) => {
    await (supabase as any).from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
    await (supabase as any).from("user_addresses").update({ is_default: true }).eq("id", id);
    setAddresses(addresses.map(a => ({ ...a, is_default: a.id === id })));
  };

  const fmt = (n: number) => `Rs ${Number(n).toLocaleString()}`;
  const statusColor = (s: string) =>
    s === "delivered" ? "default" : s === "cancelled" ? "destructive" : "secondary";

  return (
    <StoreLayout>
      <div className="container py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl">My Account</h1>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
        </div>

        <Tabs defaultValue={params.get("tab") || "orders"}>
          <TabsList>
            <TabsTrigger value="orders"><Package className="h-4 w-4 mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="wishlist"><Heart className="h-4 w-4 mr-2" />Wishlist</TabsTrigger>
            <TabsTrigger value="addresses"><MapPin className="h-4 w-4 mr-2" />Addresses</TabsTrigger>
            <TabsTrigger value="profile"><UserIcon className="h-4 w-4 mr-2" />Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist" className="mt-6">
            {wishlist.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                Your wishlist is empty. <Link to="/" className="underline ml-1">Browse products</Link>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                {wishlist.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6 space-y-3">
            {orders.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                No orders yet. <Link to="/" className="underline ml-1">Start shopping</Link>
              </CardContent></Card>
            ) : orders.map(o => (
              <Card key={o.id}>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</div>
                      <div className="text-sm mt-1">{new Date(o.created_at).toLocaleDateString()}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={statusColor(o.order_status)}>{o.order_status}</Badge>
                        <Badge variant="outline">{o.payment_status}</Badge>
                        <Badge variant="outline">{o.payment_method}</Badge>
                      </div>
                      {o.tracking_number && <div className="text-xs mt-2">Tracking: <span className="font-mono">{o.tracking_number}</span></div>}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{fmt(o.total)}</div>
                      <div className="text-xs text-muted-foreground">{Array.isArray(o.items) ? o.items.length : 0} item(s)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="addresses" className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {addresses.map(a => (
                <Card key={a.id}>
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{a.label || "Address"} {a.is_default && <Badge className="ml-2">Default</Badge>}</div>
                      <Button variant="ghost" size="icon" onClick={() => deleteAddress(a.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="text-sm">{a.full_name} · {a.phone}</div>
                    <div className="text-sm text-muted-foreground">{a.address}, {a.city}{a.state ? `, ${a.state}` : ""} {a.zip}</div>
                    <div className="text-xs text-muted-foreground">{a.country}</div>
                    {!a.is_default && <Button variant="outline" size="sm" onClick={() => setDefault(a.id)}>Set as default</Button>}
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Add new address</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label>Label</Label><Input value={newAddr.label} onChange={e => setNewAddr({ ...newAddr, label: e.target.value })} /></div>
                  <div><Label>Full name</Label><Input value={newAddr.full_name} onChange={e => setNewAddr({ ...newAddr, full_name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} /></div>
                  <div><Label>City</Label><Input value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} /></div>
                  <div className="sm:col-span-2"><Label>Address</Label><Textarea value={newAddr.address} onChange={e => setNewAddr({ ...newAddr, address: e.target.value })} /></div>
                  <div><Label>State / Province</Label><Input value={newAddr.state} onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} /></div>
                  <div><Label>Postal code</Label><Input value={newAddr.zip} onChange={e => setNewAddr({ ...newAddr, zip: e.target.value })} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={newAddr.is_default} onCheckedChange={v => setNewAddr({ ...newAddr, is_default: v })} />
                  <Label>Set as default</Label>
                </div>
                <Button onClick={addAddress} disabled={busy}><Plus className="h-4 w-4 mr-2" />Add address</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardContent className="py-6 space-y-4 max-w-md">
                <div><Label>Email</Label><Input value={user.email ?? ""} disabled /></div>
                <div><Label>Display name</Label><Input value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
                <Button onClick={saveProfile} disabled={busy}>Save</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StoreLayout>
  );
};

export default Account;
