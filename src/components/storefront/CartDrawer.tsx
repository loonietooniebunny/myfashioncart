import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

export const CartDrawer = () => {
  const { items, open, setOpen, remove, setQty, subtotal, count, clear } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">Your Bag ({count})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6 mt-4 divide-y">
          {items.length === 0 && (
            <p className="text-muted-foreground text-sm py-12 text-center">Your bag is empty.</p>
          )}
          {items.map(i => (
            <div key={i.id} className="py-4 flex gap-4">
              <img src={i.image} alt={i.name} className="w-20 h-24 object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <p className="text-sm font-medium truncate">{i.name}</p>
                  <button onClick={() => remove(i.id)} aria-label="Remove"><X className="h-4 w-4" /></button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Size {i.size}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border">
                    <button className="px-2 py-1" onClick={() => setQty(i.id, i.qty - 1)}><Minus className="h-3 w-3" /></button>
                    <span className="px-3 text-xs">{i.qty}</span>
                    <button className="px-2 py-1" onClick={() => setQty(i.id, i.qty + 1)}><Plus className="h-3 w-3" /></button>
                  </div>
                  <p className="text-sm">${(i.price * i.qty).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <SheetFooter className="border-t pt-4 mt-2 flex-col gap-3 sm:flex-col">
          <div className="flex justify-between w-full text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
          <Button asChild className="w-full rounded-none h-12 tracking-wider-2 text-xs uppercase" disabled={items.length === 0}>
            <Link to="/checkout" onClick={() => setOpen(false)}>Checkout</Link>
          </Button>
          {items.length > 0 && (
            <button className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4" onClick={clear}>Clear bag</button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
