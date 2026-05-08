import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useWishlist = () => {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setIds(new Set()); setLoading(false); return; }
    const { data } = await (supabase as any).from("wishlists").select("product_id").eq("user_id", user.id);
    setIds(new Set((data ?? []).map((r: any) => r.product_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (productId: string) => {
    if (!user) { toast.error("Sign in to save items"); return; }
    if (ids.has(productId)) {
      await (supabase as any).from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      const next = new Set(ids); next.delete(productId); setIds(next);
      toast.success("Removed from wishlist");
    } else {
      await (supabase as any).from("wishlists").insert({ user_id: user.id, product_id: productId });
      setIds(new Set(ids).add(productId));
      toast.success("Saved to wishlist");
    }
  };

  return { ids, has: (id: string) => ids.has(id), toggle, loading, reload: load };
};
