import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CrudDialog, ConfirmDeleteDialog } from "@/components/qehs/CrudDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Leaf, Wind, Droplets, Activity, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Reading = Database["public"]["Tables"]["environmental_readings"]["Row"];

export const Route = createFileRoute("/environmental")({
  head: () => ({ meta: [{ title: "Environmental — QEHS Live" }] }),
  component: Environmental,
});

const schema = z.object({
  site: z.string().trim().min(1).max(100),
  metric: z.string().trim().min(1).max(100),
  value: z.coerce.number(),
  unit: z.string().trim().min(1).max(20),
  notes: z.string().trim().max(500).optional().nullable(),
});

function Environmental() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Reading | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("environmental_readings").select("*").order("recorded_at", { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      site: fd.get("site"), metric: fd.get("metric"),
      value: fd.get("value"), unit: fd.get("unit"),
      notes: fd.get("notes") || null,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (editing) {
      const { error } = await supabase.from("environmental_readings").update(parsed.data).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Reading updated");
    } else {
      const { error } = await supabase.from("environmental_readings").insert({ ...parsed.data, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Reading recorded");
    }
    setDialogOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("environmental_readings").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setDeleteId(null);
    void load();
  };

  const air = rows.filter(r => /pm|nox|so2|co|air|dust/i.test(r.metric)).length;
  const water = rows.filter(r => /water|ph|tds|effluent/i.test(r.metric)).length;
  const noise = rows.filter(r => /noise|db/i.test(r.metric)).length;

  return (
    <AppShell title="Environmental Monitoring" subtitle="Air, water, noise, and emissions tracking"
      actions={<Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setDialogOpen(true); }} data-toast-handled="1"><Plus className="h-4 w-4"/>Record Reading</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Air Readings" value={air} icon={Wind} tone="info"/>
        <KpiCard label="Water Readings" value={water} icon={Droplets} tone="primary"/>
        <KpiCard label="Noise Readings" value={noise} icon={Activity} tone="warning"/>
        <KpiCard label="Total Logged" value={rows.length} icon={Leaf} tone="success"/>
      </div>

      <Section title="Recent Readings">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="px-5 py-2.5 font-medium">Site</th><th className="py-2.5 font-medium">Metric</th>
              <th className="py-2.5 font-medium">Value</th><th className="py-2.5 font-medium">Recorded</th>
              <th className="py-2.5 font-medium">Notes</th><th className="px-5 py-2.5 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No readings yet.</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{r.site}</td>
                  <td className="py-3 text-muted-foreground">{r.metric}</td>
                  <td className="py-3 font-medium">{r.value} <span className="text-xs text-muted-foreground">{r.unit}</span></td>
                  <td className="py-3 text-muted-foreground">{new Date(r.recorded_at).toLocaleString()}</td>
                  <td className="py-3 text-muted-foreground truncate max-w-[200px]">{r.notes ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(r); setDialogOpen(true); }} data-toast-handled="1"><Pencil className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)} data-toast-handled="1"><Trash2 className="h-4 w-4"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? "Edit Reading" : "Record Reading"}
        onSubmit={handleSubmit} busy={busy} submitLabel={editing ? "Save changes" : "Record"}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="site">Site</Label>
            <Input id="site" name="site" required defaultValue={editing?.site ?? ""} placeholder="Yard B"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metric">Metric</Label>
            <Input id="metric" name="metric" required defaultValue={editing?.metric ?? ""} placeholder="PM2.5"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="value">Value</Label>
            <Input id="value" name="value" type="number" step="any" required defaultValue={editing?.value ?? ""}/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" name="unit" required defaultValue={editing?.unit ?? "mg/m3"}/>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" defaultValue={editing?.notes ?? ""} placeholder="Within limits"/>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete} busy={busy} title="Delete reading?"/>
    </AppShell>
  );
}
