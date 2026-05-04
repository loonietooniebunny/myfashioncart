import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Download, FileText } from "lucide-react";
import { toast } from "sonner";

type Order = any;

export const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("orders").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: any) => {
    const { error } = await (supabase as any).from("orders").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await (supabase as any).from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const [fPayment, setFPayment] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fCity, setFCity] = useState("all");
  const [fMethod, setFMethod] = useState("all");
  const [query, setQuery] = useState("");

  const cities = useMemo(
    () => Array.from(new Set(orders.map(o => o.shipping_city).filter(Boolean))).sort(),
    [orders]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(o =>
      (fPayment === "all" || o.payment_status === fPayment) &&
      (fStatus === "all" || o.order_status === fStatus) &&
      (fCity === "all" || o.shipping_city === fCity) &&
      (fMethod === "all" || o.payment_method === fMethod) &&
      (q === "" ||
        String(o.id).toLowerCase().includes(q) ||
        (o.customer_name ?? "").toLowerCase().includes(q))
    );
  }, [orders, fPayment, fStatus, fCity, fMethod, query]);

  const reset = () => { setFPayment("all"); setFStatus("all"); setFCity("all"); setFMethod("all"); setQuery(""); };
  const hasFilters = fPayment !== "all" || fStatus !== "all" || fCity !== "all" || fMethod !== "all" || query !== "";

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (orders.length === 0) return <p className="text-muted-foreground text-sm">No orders yet.</p>;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select value={fPayment} onValueChange={setFPayment}>
          <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Payment status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment statuses</SelectItem>
            {["pending", "awaiting_verification", "paid", "failed", "refunded"].map(s =>
              <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Fulfillment status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fulfillment statuses</SelectItem>
            {["pending", "processing", "shipped", "delivered", "cancelled"].map(s =>
              <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fCity} onValueChange={setFCity}>
          <SelectTrigger className="h-9 w-48"><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && <Button variant="ghost" size="sm" onClick={reset}>Clear</Button>}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} of {orders.length}</span>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
      <div className="space-y-3 mb-4">
        <div className="relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order ID or customer name…"
            className="pl-9 h-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={fPayment} onValueChange={setFPayment}>
            <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Payment status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payment statuses</SelectItem>
              {["pending", "awaiting_verification", "paid", "failed", "refunded"].map(s =>
                <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Fulfillment status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fulfillment statuses</SelectItem>
              {["pending", "processing", "shipped", "delivered", "cancelled"].map(s =>
                <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fMethod} onValueChange={setFMethod}>
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Payment method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="cod">Cash on Delivery</SelectItem>
              <SelectItem value="easypaisa">EasyPaisa</SelectItem>
              <SelectItem value="jazzcash">JazzCash</SelectItem>
              <SelectItem value="card">Bank Transfer / Card</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fCity} onValueChange={setFCity}>
            <SelectTrigger className="h-9 w-48"><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && <Button variant="ghost" size="sm" onClick={reset}>Clear</Button>}
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} of {orders.length}</span>
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Method</th>
              <th className="p-3">Receipt</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-3 whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <p className="font-medium">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                </td>
                <td className="p-3 whitespace-nowrap">PKR {Number(o.total).toLocaleString()}</td>
                <td className="p-3 capitalize">{o.payment_method}</td>
                <td className="p-3">
                  <Select value={o.payment_status} onValueChange={(v) => update(o.id, { payment_status: v })}>
                    <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pending", "awaiting_verification", "paid", "failed", "refunded"].map(s =>
                        <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <Select value={o.order_status} onValueChange={(v) => update(o.id, { order_status: v })}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pending", "processing", "shipped", "delivered", "cancelled"].map(s =>
                        <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(o)}>View</Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(o.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Order details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Customer</p><p>{selected.customer_name}</p><p>{selected.customer_email}</p><p>{selected.customer_phone}</p></div>
                <div><p className="text-muted-foreground">Shipping</p><p>{selected.shipping_address}</p><p>{selected.shipping_city}, {selected.shipping_state} {selected.shipping_zip}</p><p>{selected.shipping_country}</p></div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Payment</p>
                <Badge variant="outline" className="capitalize mr-2">{selected.payment_method}</Badge>
                {selected.payment_reference && <span>Ref: <b>{selected.payment_reference}</b></span>}
                {selected.receipt_url && (
                  <div className="mt-2">
                    <a href={selected.receipt_url} target="_blank" rel="noreferrer" className="inline-block">
                      <img src={selected.receipt_url} alt="Receipt" className="max-h-48 border" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-xs underline block mt-1">Open receipt</span>
                    </a>
                  </div>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Tracking number</p>
                  <Input defaultValue={selected.tracking_number ?? ""} onBlur={(e) => update(selected.id, { tracking_number: e.target.value })} placeholder="Courier tracking #" />
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Fulfillment note</p>
                  <Textarea defaultValue={selected.fulfillment_note ?? ""} onBlur={(e) => update(selected.id, { fulfillment_note: e.target.value })} rows={2} placeholder="Internal note" />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {(selected.items ?? []).map((it: any, idx: number) => (
                    <div key={idx} className="flex gap-3 border p-2">
                      {it.image && <img src={it.image} className="w-12 h-14 object-cover" alt="" />}
                      <div className="flex-1">
                        <p className="font-medium">{it.name}</p>
                        <p className="text-xs text-muted-foreground">Size {it.size} · Qty {it.qty}</p>
                      </div>
                      <p>PKR {(it.price * it.qty).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>PKR {Number(selected.subtotal).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping/Fees</span><span>PKR {Number(selected.shipping_fee).toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>PKR {Number(selected.total).toLocaleString()}</span></div>
              </div>
              {selected.notes && <div><p className="text-muted-foreground">Notes</p><p>{selected.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
