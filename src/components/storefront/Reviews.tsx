import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type Review = {
  id: string; user_id: string | null; customer_name: string;
  rating: number; title: string | null; body: string | null; created_at: string;
};

export const Reviews = ({ productId }: { productId: string }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    supabase.from("reviews").select("*").eq("product_id", productId).eq("is_approved", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data ?? []) as Review[]));
  };
  useEffect(load, [productId]);

  useEffect(() => {
    if (user && !name) {
      supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
        .then(({ data }) => setName(data?.display_name ?? user.email?.split("@")[0] ?? ""));
    }
  }, [user]);

  const avg = reviews.length === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const mine = user ? reviews.find(r => r.user_id === user.id) : null;

  const submit = async () => {
    if (!user) { toast.error("Sign in to leave a review"); return; }
    if (!name.trim()) { toast.error("Your name is required"); return; }
    setBusy(true);
    const payload = { product_id: productId, user_id: user.id, customer_name: name.trim(), rating, title: title.trim() || null, body: body.trim() || null };
    const res = mine
      ? await supabase.from("reviews").update(payload).eq("id", mine.id)
      : await supabase.from("reviews").insert(payload);
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(mine ? "Review updated" : "Review posted");
    setTitle(""); setBody(""); setRating(5);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-serif text-2xl">Reviews</h3>
          {reviews.length > 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={avg} size={18} />
              <span className="text-sm text-muted-foreground">{avg.toFixed(1)} · {reviews.length} review{reviews.length > 1 ? "s" : ""}</span>
            </div>
          ) : <p className="text-sm text-muted-foreground mt-1">No reviews yet — be the first.</p>}
        </div>
      </div>

      {user ? (
        <div className="border border-border p-5 space-y-3 bg-card">
          <p className="text-sm font-medium">{mine ? "Update your review" : "Write a review"}</p>
          <div>
            <Label className="text-xs">Your rating</Label>
            <div className="mt-1"><StarRating value={rating} size={24} onChange={setRating} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label className="text-xs">Your name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label className="text-xs">Title (optional)</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          </div>
          <div><Label className="text-xs">Your review</Label><Textarea value={body} onChange={e => setBody(e.target.value)} rows={3} /></div>
          <Button onClick={submit} disabled={busy}>{mine ? "Update review" : "Post review"}</Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to leave a review.</p>
      )}

      <div className="space-y-5">
        {reviews.map(r => (
          <div key={r.id} className="border-b border-border pb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <StarRating value={r.rating} />
                {r.title && <p className="font-medium mt-1">{r.title}</p>}
                <p className="text-xs text-muted-foreground mt-1">{r.customer_name} · {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              {user?.id === r.user_id && (
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {r.body && <p className="text-sm mt-2 leading-relaxed">{r.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
