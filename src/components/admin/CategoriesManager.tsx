import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type Category = { id: string; name: string; slug: string; description: string | null };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const CategoriesManager = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) toast.error(error.message);
    else setItems(data as Category[]);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setEditing(null); setName(""); setSlug(""); setDescription(""); };

  const openNew = () => { reset(); setOpen(true); };
  const openEdit = (c: Category) => {
    setEditing(c); setName(c.name); setSlug(c.slug); setDescription(c.description ?? ""); setOpen(true);
  };

  const save = async () => {
    const payload = { name: name.trim(), slug: slug.trim() || slugify(name), description: description.trim() || null };
    if (!payload.name) { toast.error("Name required"); return; }
    const res = editing
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    if (res.error) toast.error(res.error.message);
    else { toast.success("Saved"); setOpen(false); reset(); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categories</CardTitle>
        <Dialog open={open} onOpenChange={(o)=>{ setOpen(o); if(!o) reset(); }}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={name} onChange={e=>{ setName(e.target.value); if(!editing) setSlug(slugify(e.target.value)); }} /></div>
              <div><Label>Slug</Label><Input value={slug} onChange={e=>setSlug(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea value={description} onChange={e=>setDescription(e.target.value)} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {items.length === 0 && <p className="text-muted-foreground text-sm py-4">No categories yet.</p>}
          {items.map(c => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">/{c.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={()=>openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={()=>remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
