import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (orders.length === 0) return <p className="text-muted-foreground text-sm">No orders yet.</p>;

  return (
    <>
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Method</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
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
