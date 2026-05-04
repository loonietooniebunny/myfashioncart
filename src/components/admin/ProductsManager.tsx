import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string; name: string; slug: string; description: string | null;
  price: number; compare_at_price: number | null;
  sizes: string[]; images: string[]; stock: number;
  is_featured: boolean; is_active: boolean;
  category_id: string | null;
};
type Category = { id: string; name: string };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const ProductsManager = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  const empty = {
    name: "", slug: "", description: "", price: "0", compare_at_price: "",
    sizes: "", stock: "0", category_id: "", is_featured: false, is_active: true,
    images: [] as string[],
  };
  const [form, setForm] = useState(empty);

  const load = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").order("name"),
    ]);
    if (p.error) toast.error(p.error.message); else setItems(p.data as Product[]);
    if (c.error) toast.error(c.error.message); else setCats(c.data as Category[]);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description ?? "",
      price: String(p.price), compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      sizes: p.sizes.join(", "), stock: String(p.stock),
      category_id: p.category_id ?? "", is_featured: p.is_featured, is_active: p.is_active,
      images: [...p.images],
    });
    setOpen(true);
  };

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setForm(f => ({ ...f, images: [...f.images, ...urls] }));
      toast.success("Images uploaded");
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const removeImage = (url: string) => setForm(f => ({ ...f, images: f.images.filter(u => u !== url) }));

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    const payload = {
      name: form.name.trim(),
      slug: (form.slug.trim() || slugify(form.name)),
      description: form.description.trim() || null,
      price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      sizes: form.sizes.split(",").map(s=>s.trim()).filter(Boolean),
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      images: form.images,
    };
    const res = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (res.error) toast.error(res.error.message);
    else { toast.success("Saved"); setOpen(false); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} product</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value)}))} /></div>
                <div><Label>Slug</Label><Input value={form.slug} onChange={e=>setForm(f=>({...f, slug: e.target.value}))} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e=>setForm(f=>({...f, description: e.target.value}))} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Price</Label><Input type="number" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f, price: e.target.value}))} /></div>
                <div><Label>Compare at</Label><Input type="number" step="0.01" value={form.compare_at_price} onChange={e=>setForm(f=>({...f, compare_at_price: e.target.value}))} /></div>
                <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e=>setForm(f=>({...f, stock: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category_id || "none"} onValueChange={v=>setForm(f=>({...f, category_id: v==="none"?"":v}))}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Sizes (comma separated)</Label><Input value={form.sizes} onChange={e=>setForm(f=>({...f, sizes: e.target.value}))} placeholder="S, M, L, XL" /></div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v=>setForm(f=>({...f, is_active: v}))} /><Label>Active</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v=>setForm(f=>({...f, is_featured: v}))} /><Label>Featured</Label></div>
              </div>
              <div>
                <Label>Images</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {form.images.map(url => (
                    <div key={url} className="relative group">
                      <img src={url} className="w-full h-24 object-cover rounded border" />
                      <button onClick={()=>removeImage(url)} className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded cursor-pointer hover:bg-muted">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">{uploading ? "..." : "Upload"}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e=>upload(e.target.files)} />
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={save} disabled={uploading}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {items.length === 0 && <p className="text-muted-foreground text-sm py-4">No products yet.</p>}
          {items.map(p => (
            <div key={p.id} className="flex items-center justify-between py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {p.images[0]
                  ? <img src={p.images[0]} className="w-12 h-12 rounded object-cover" />
                  : <div className="w-12 h-12 rounded bg-muted" />}
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name} {!p.is_active && <span className="text-xs text-muted-foreground">(hidden)</span>}</p>
                  <p className="text-sm text-muted-foreground">${Number(p.price).toFixed(2)} · stock {p.stock}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="icon" variant="ghost" onClick={()=>openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={()=>remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
