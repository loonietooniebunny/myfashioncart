import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Check, Clock, Package, Truck, Home as HomeIcon, XCircle, LifeBuoy, Mail, MessageCircle } from "lucide-react";

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  total: number;
  subtotal: number;
  shipping_fee: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  tracking_number: string | null;
  created_at: string;
  items: Array<{ name: string; qty: number; price: number; image: string; size?: string }>;
};

const STEPS = [
  { key: "pending", label: "Confirmed", icon: Check, desc: "We received your order" },
  { key: "processing", label: "Processing", icon: Package, desc: "Packing your items" },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "On the way to you" },
  { key: "delivered", label: "Delivered", icon: HomeIcon, desc: "Order delivered" },
];

const OrderStatus = () => {
  const { id } = useParams();
  const { settings } = useSiteSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;

    const load = async () => {
      const { data, error } = await (supabase as any).from("orders").select("*").eq("id", id).maybeSingle();
      if (!active) return;
      if (error) setErr(error.message);
      else if (!data) setErr("Order not found");
      else setOrder(data as Order);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload) => setOrder(payload.new as any))
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [id]);

  const status = order?.order_status ?? "pending";
  const cancelled = status === "cancelled";
  const currentIdx = cancelled ? -1 : Math.max(0, STEPS.findIndex(s => s.key === status));

  return (
    <StoreLayout>
      <div className="container max-w-3xl py-8 sm:py-14 px-4">
        {loading && <p className="text-center text-muted-foreground py-12">Loading order…</p>}
        {err && (
          <div className="text-center py-12">
            <XCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-serif text-2xl mb-2">{err}</p>
            <Link to="/" className="text-sm underline">Back to store</Link>
          </div>
        )}

        {order && (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-xs tracking-luxe uppercase text-muted-foreground">Order</p>
              <h1 className="font-serif text-3xl sm:text-4xl mt-1 break-all">#{order.id.slice(0, 8).toUpperCase()}</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Placed {new Date(order.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            {/* Timeline */}
            <div className="bg-secondary p-5 sm:p-8 mb-6">
              <p className="text-xs tracking-luxe uppercase mb-6">Progress</p>

              {cancelled ? (
                <div className="flex items-center gap-3 text-destructive">
                  <XCircle className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Order cancelled</p>
                    <p className="text-sm text-muted-foreground">Contact support if this was a mistake.</p>
                  </div>
                </div>
              ) : (
                <ol className="space-y-5 sm:space-y-0 sm:flex sm:justify-between sm:items-start sm:relative">
                  <span className="hidden sm:block absolute top-5 left-[10%] right-[10%] h-px bg-border" aria-hidden />
                  {STEPS.map((s, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    const Icon = s.icon;
                    return (
                      <li key={s.key} className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 sm:flex-1 sm:relative sm:z-10">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                          done ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border"
                        } ${active ? "ring-4 ring-foreground/10" : ""}`}>
                          {done && !active ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div className="sm:text-center">
                          <p className={`text-sm font-medium ${done ? "" : "text-muted-foreground"}`}>{s.label}</p>
                          <p className="text-xs text-muted-foreground sm:max-w-[120px]">{s.desc}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              {order.tracking_number && (
                <div className="mt-6 pt-5 border-t text-sm">
                  <span className="text-muted-foreground">Tracking #: </span>
                  <span className="font-mono">{order.tracking_number}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-secondary p-5 sm:p-8 mb-6">
              <p className="text-xs tracking-luxe uppercase mb-4">Items</p>
              <div className="divide-y">
                {order.items?.map((it, i) => (
                  <div key={i} className="py-3 flex gap-3 text-sm">
                    {it.image && <img src={it.image} alt="" className="w-14 h-16 object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{it.name}</p>
                      <p className="text-xs text-muted-foreground">{it.size ? `Size ${it.size} · ` : ""}Qty {it.qty}</p>
                    </div>
                    <p className="shrink-0">PKR {(it.price * it.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>PKR {order.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>PKR {order.shipping_fee.toLocaleString()}</span></div>
                <div className="flex justify-between font-medium pt-2 border-t mt-1"><span>Total</span><span>PKR {order.total.toLocaleString()}</span></div>
              </div>
            </div>

            {/* Details */}
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-secondary p-5">
                <p className="text-xs tracking-luxe uppercase mb-2">Shipping to</p>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-muted-foreground">{order.shipping_address}</p>
                <p className="text-muted-foreground">{order.shipping_city}</p>
                <p className="text-muted-foreground mt-1">{order.customer_phone}</p>
              </div>
              <div className="bg-secondary p-5">
                <p className="text-xs tracking-luxe uppercase mb-2">Payment</p>
                <p className="font-medium capitalize">{order.payment_method.replace("_", " ")}</p>
                <p className="text-muted-foreground capitalize flex items-center gap-1.5 mt-1">
                  <Clock className="h-3 w-3" /> {order.payment_status.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="text-center mt-10">
              <Link to="/" className="text-xs tracking-luxe uppercase underline">Continue shopping</Link>
            </div>
          </>
        )}
      </div>
    </StoreLayout>
  );
};

export default OrderStatus;
