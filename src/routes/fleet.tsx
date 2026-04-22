import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell, StatusBadge } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CrudDialog, ConfirmDeleteDialog } from "@/components/qehs/CrudDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Truck, Wrench, AlertCircle, CheckCircle2, Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type Status = "active" | "grounded" | "maintenance";

export const Route = createFileRoute("/fleet")({
  head: () => ({ meta: [{ title: "Fleet & Equipment — QEHS Live" }] }),
  component: Fleet,
});

const schema = z.object({
  asset_id: z.string().trim().min(1).max(50),
  type: z.string().trim().min(1).max(50),
  driver: z.string().trim().max(100).optional().nullable(),
  site: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["active", "grounded", "maintenance"]),
});

function Fleet() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (v: Vehicle) => { setEditing(v); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      asset_id: fd.get("asset_id"),
      type: fd.get("type"),
      driver: fd.get("driver") || null,
      site: fd.get("site") || null,
      status: fd.get("status"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (editing) {
      const { error } = await supabase.from("vehicles").update(parsed.data).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Vehicle updated");
    } else {
      const { error } = await supabase.from("vehicles").insert({ ...parsed.data, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Vehicle added");
    }
    setDialogOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("vehicles").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Vehicle deleted");
    setDeleteId(null);
    void load();
  };

  const filtered = rows.filter((v) =>
    !search ||
    v.asset_id.toLowerCase().includes(search.toLowerCase()) ||
    v.type.toLowerCase().includes(search.toLowerCase()) ||
    (v.driver ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (v.site ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    active: rows.filter((r) => r.status === "active").length,
    grounded: rows.filter((r) => r.status === "grounded").length,
    maintenance: rows.filter((r) => r.status === "maintenance").length,
  };

  return (
    <AppShell title="Fleet & Equipment" subtitle="Track inspections, status, and compliance for every asset"
      actions={<Button size="sm" className="gap-1.5" onClick={openCreate} data-toast-handled="1"><Plus className="h-4 w-4"/>Add Vehicle</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active" value={counts.active} icon={CheckCircle2} tone="success"/>
        <KpiCard label="Grounded" value={counts.grounded} icon={AlertCircle} tone="destructive"/>
        <KpiCard label="In Maintenance" value={counts.maintenance} icon={Wrench} tone="warning"/>
        <KpiCard label="Total Fleet" value={rows.length} icon={Truck} tone="primary"/>
      </div>

      <Section title="Vehicle Register"
        action={<div className="relative w-56"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input className="pl-9 h-9" placeholder="Search vehicles…" value={search} onChange={(e) => setSearch(e.target.value)}/></div>}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-2.5 font-medium">Asset ID</th>
                <th className="py-2.5 font-medium">Type</th>
                <th className="py-2.5 font-medium">Driver</th>
                <th className="py-2.5 font-medium">Site</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                  {rows.length === 0 ? "No vehicles yet — add your first one." : "No matches."}
                </td></tr>
              ) : filtered.map((v) => (
                <tr key={v.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3 font-medium">{v.asset_id}</td>
                  <td className="py-3 text-muted-foreground">{v.type}</td>
                  <td className="py-3">{v.driver ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{v.site ?? "—"}</td>
                  <td className="py-3"><StatusBadge status={v.status as Status}/></td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)} data-toast-handled="1"><Pencil className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(v.id)} data-toast-handled="1"><Trash2 className="h-4 w-4"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <CrudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit Vehicle" : "Add Vehicle"}
        description="Maintain accurate fleet records for inspections and compliance."
        onSubmit={handleSubmit}
        busy={busy}
        submitLabel={editing ? "Save changes" : "Create"}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="asset_id">Asset ID</Label>
            <Input id="asset_id" name="asset_id" required defaultValue={editing?.asset_id ?? ""} placeholder="TRK-1042"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <Input id="type" name="type" required defaultValue={editing?.type ?? ""} placeholder="Tanker"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="driver">Driver</Label>
            <Input id="driver" name="driver" defaultValue={editing?.driver ?? ""} placeholder="M. Hassan"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site">Site</Label>
            <Input id="site" name="site" defaultValue={editing?.site ?? ""} placeholder="Jeddah Port"/>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={editing?.status ?? "active"}>
            <SelectTrigger id="status"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">In maintenance</SelectItem>
              <SelectItem value="grounded">Grounded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        busy={busy}
        title="Delete vehicle?"
        description="This will remove the vehicle and its inspection history references."
      />
    </AppShell>
  );
}
