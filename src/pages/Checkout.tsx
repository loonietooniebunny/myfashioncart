import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
  const total = subtotal + shipping;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setBusy(true);
    setTimeout(() => {
      toast.success("Order placed (demo). Thank you.");
      clear();
      nav("/");
    }, 900);
  };

  return (
    <StoreLayout>
      <div className="container py-12 md:py-20 grid lg:grid-cols-2 gap-12">
        <form onSubmit={submit} className="space-y-8">
          <h1 className="font-serif text-4xl">Checkout</h1>
          <section className="space-y-3">
            <p className="text-xs tracking-luxe uppercase">Contact</p>
            <Input required type="email" placeholder="Email" className="rounded-none h-12" />
          </section>
          <section className="space-y-3">
            <p className="text-xs tracking-luxe uppercase">Shipping</p>
            <div className="grid grid-cols-2 gap-3">
              <Input required placeholder="First name" className="rounded-none h-12" />
              <Input required placeholder="Last name" className="rounded-none h-12" />
            </div>
            <Input required placeholder="Address" className="rounded-none h-12" />
            <div className="grid grid-cols-3 gap-3">
              <Input required placeholder="City" className="rounded-none h-12" />
              <Input required placeholder="State" className="rounded-none h-12" />
              <Input required placeholder="ZIP" className="rounded-none h-12" />
            </div>
            <Input required placeholder="Country" className="rounded-none h-12" defaultValue="United States" />
          </section>
          <section className="space-y-3">
            <p className="text-xs tracking-luxe uppercase">Payment (demo)</p>
            <Input required placeholder="Card number" className="rounded-none h-12" />
            <div className="grid grid-cols-2 gap-3">
              <Input required placeholder="MM / YY" className="rounded-none h-12" />
              <Input required placeholder="CVC" className="rounded-none h-12" />
            </div>
          </section>
          <Button disabled={busy || items.length === 0} className="w-full rounded-none h-12 tracking-wider-2 text-xs uppercase">
            {busy ? "Placing order…" : `Pay $${total.toLocaleString()}`}
          </Button>
          <p className="text-xs text-muted-foreground">This is a demo checkout — no real payment is processed.</p>
        </form>

        <aside className="bg-secondary p-6 md:p-8 h-fit lg:sticky lg:top-28">
          <p className="text-xs tracking-luxe uppercase mb-4">Order Summary</p>
          <div className="divide-y">
            {items.length === 0 && <p className="text-sm text-muted-foreground py-6">Your bag is empty. <Link to="/" className="underline">Continue shopping</Link></p>}
            {items.map(i => (
              <div key={i.id} className="py-3 flex gap-3 text-sm">
                <img src={i.image} className="w-14 h-16 object-cover" alt="" />
                <div className="flex-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">Size {i.size} · Qty {i.qty}</p>
                </div>
                <p>${(i.price * i.qty).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping}`}</span></div>
            <div className="flex justify-between text-base pt-2 border-t mt-2"><span>Total</span><span>${total.toLocaleString()}</span></div>
          </div>
        </aside>
      </div>
    </StoreLayout>
  );
};

export default Checkout;
