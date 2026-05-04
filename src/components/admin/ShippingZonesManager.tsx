import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

type Zone = {
  id?: string;
  city: string;
  fee: number;
  cod_fee: number;
  estimated_days: string | null;
  is_active: boolean;
};

export const ShippingZonesManager = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<Zone>({ city: "", fee: 0, cod_fee: 0, estimated_days: "", is_active: true });

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("shipping_zones").select("*").order("city");
    if (error) toast.error(error.message);
    setZones(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<Zone>) => {
    const { error } = await (supabase as any).from("shipping_zones").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setZones(zs => zs.map(z => z.id === id ? { ...z, ...patch } : z));
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this city?")) return;
    const { error } = await (supabase as any).from("shipping_zones").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  const create = async () => {
    if (!adding.city.trim()) return toast.error("City name required");
    const { error } = await (supabase as any).from("shipping_zones").insert(adding);
    if (error) return toast.error(error.message);
    toast.success("City added");
    setAdding({ city: "", fee: 0, cod_fee: 0, estimated_days: "", is_active: true });
    load();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <p className="text-sm text-muted-foreground">Set per-city shipping & COD fees. Customers select their city at checkout.</p>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">City</th>
              <th className="p-3">Shipping (PKR)</th>
              <th className="p-3">COD fee (PKR)</th>
              <th className="p-3">ETA</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {zones.map(z => (
              <tr key={z.id} className="border-t">
                <td className="p-2"><Input defaultValue={z.city} onBlur={(e) => e.target.value !== z.city && update(z.id!, { city: e.target.value })} className="h-8" /></td>
                <td className="p-2"><Input type="number" defaultValue={z.fee} onBlur={(e) => update(z.id!, { fee: Number(e.target.value) })} className="h-8 w-28" /></td>
                <td className="p-2"><Input type="number" defaultValue={z.cod_fee} onBlur={(e) => update(z.id!, { cod_fee: Number(e.target.value) })} className="h-8 w-28" /></td>
                <td className="p-2"><Input defaultValue={z.estimated_days ?? ""} onBlur={(e) => update(z.id!, { estimated_days: e.target.value })} className="h-8 w-28" /></td>
                <td className="p-2"><Switch checked={z.is_active} onCheckedChange={(v) => update(z.id!, { is_active: v })} /></td>
                <td className="p-2"><Button variant="ghost" size="icon" onClick={() => remove(z.id!)}><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border rounded-md p-4 space-y-3">
        <h4 className="font-medium text-sm">Add a city</h4>
        <div className="grid sm:grid-cols-5 gap-2">
          <Input placeholder="City" value={adding.city} onChange={(e) => setAdding({ ...adding, city: e.target.value })} />
          <Input type="number" placeholder="Shipping" value={adding.fee} onChange={(e) => setAdding({ ...adding, fee: Number(e.target.value) })} />
          <Input type="number" placeholder="COD fee" value={adding.cod_fee} onChange={(e) => setAdding({ ...adding, cod_fee: Number(e.target.value) })} />
          <Input placeholder="ETA e.g. 2-3 days" value={adding.estimated_days ?? ""} onChange={(e) => setAdding({ ...adding, estimated_days: e.target.value })} />
          <Button onClick={create}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
      </div>
    </div>
  );
};
