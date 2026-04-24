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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CrudDialog, ConfirmDeleteDialog } from "@/components/qehs/CrudDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Route as RouteIcon, MapPin, Phone, AlertOctagon, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Trip = Database["public"]["Tables"]["journey_trips"]["Row"];

export const Route = createFileRoute("/journey")({
  head: () => ({ meta: [{ title: "Journey Management — QEHS Live" }] }),
  component: Journey,
});

const schema = z.object({
  trip_number: z.string().trim().min(1).max(50),
  driver: z.string().trim().min(1).max(100),
  vehicle: z.string().trim().max(50).optional().nullable(),
  origin: z.string().trim().min(1).max(100),
  destination: z.string().trim().min(1).max(100),
  distance_km: z.coerce.number().optional().nullable(),
  eta: z.string().trim().max(50).optional().nullable(),
  status: z.enum(["pending", "in-progress", "closed", "overdue"]),
});

function Journey() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("journey_trips").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const distance = fd.get("distance_km");
    const parsed = schema.safeParse({
      trip_number: fd.get("trip_number"), driver: fd.get("driver"),
      vehicle: fd.get("vehicle") || null, origin: fd.get("origin"),
      destination: fd.get("destination"),
      distance_km: distance ? distance : null,
      eta: fd.get("eta") || null, status: fd.get("status"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (editing) {
      const { error } = await supabase.from("journey_trips").update(parsed.data).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Trip updated");
    } else {
      const { error } = await supabase.from("journey_trips").insert({ ...parsed.data, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Trip registered");
    }
    setDialogOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("journey_trips").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setDeleteId(null);
    void load();
  };

  const counts = {
    active: rows.filter(r => r.status === "in-progress").length,
    pending: rows.filter(r => r.status === "pending").length,
    closed: rows.filter(r => r.status === "closed").length,
    overdue: rows.filter(r => r.status === "overdue").length,
  };

  return (
    <AppShell title="Journey Management" subtitle="Trip planning, route tracking, and driver safety"
      actions={<Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setDialogOpen(true); }} data-toast-handled="1"><Plus className="h-4 w-4"/>Register Trip</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active Trips" value={counts.active} icon={RouteIcon} tone="primary"/>
        <KpiCard label="Pending" value={counts.pending} icon={MapPin} tone="warning"/>
        <KpiCard label="Closed" value={counts.closed} icon={Phone} tone="success"/>
        <KpiCard label="Overdue" value={counts.overdue} icon={AlertOctagon} tone="destructive"/>
      </div>

      <Section title="Trips">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="px-5 py-2.5 font-medium">Trip ID</th><th className="py-2.5 font-medium">Driver</th>
              <th className="py-2.5 font-medium">From → To</th><th className="py-2.5 font-medium">Vehicle</th>
              <th className="py-2.5 font-medium">ETA</th><th className="py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No trips registered yet.</td></tr>
              ) : rows.map(t => (
                <tr key={t.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{t.trip_number}</td>
                  <td className="py-3">{t.driver}</td>
                  <td className="py-3 text-muted-foreground">{t.origin} → {t.destination}</td>
                  <td className="py-3">{t.vehicle ?? "—"}</td>
                  <td className="py-3">{t.eta ?? "—"}</td>
                  <td className="py-3"><StatusBadge status={t.status as "pending" | "in-progress" | "closed" | "overdue"}/></td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(t); setDialogOpen(true); }} data-toast-handled="1"><Pencil className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(t.id)} data-toast-handled="1"><Trash2 className="h-4 w-4"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? "Edit Trip" : "Register Trip"}
        onSubmit={handleSubmit} busy={busy} submitLabel={editing ? "Save changes" : "Register"}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="trip_number">Trip number</Label>
            <Input id="trip_number" name="trip_number" required defaultValue={editing?.trip_number ?? ""} placeholder="TRP-3041"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="driver">Driver</Label>
            <Input id="driver" name="driver" required defaultValue={editing?.driver ?? ""} placeholder="M. Hassan"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="origin">Origin</Label>
            <Input id="origin" name="origin" required defaultValue={editing?.origin ?? ""} placeholder="Jeddah Port"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="destination">Destination</Label>
            <Input id="destination" name="destination" required defaultValue={editing?.destination ?? ""} placeholder="Riyadh DC"/>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="vehicle">Vehicle</Label>
            <Input id="vehicle" name="vehicle" defaultValue={editing?.vehicle ?? ""} placeholder="TRK-1042"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="distance_km">Distance (km)</Label>
            <Input id="distance_km" name="distance_km" type="number" step="any" defaultValue={editing?.distance_km ?? ""}/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eta">ETA</Label>
            <Input id="eta" name="eta" defaultValue={editing?.eta ?? ""} placeholder="4h 12m"/>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={editing?.status ?? "pending"}>
            <SelectTrigger id="status"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete} busy={busy} title="Delete trip?"/>
    </AppShell>
  );
}
