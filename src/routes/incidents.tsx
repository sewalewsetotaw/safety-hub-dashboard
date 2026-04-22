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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CrudDialog, ConfirmDeleteDialog } from "@/components/qehs/CrudDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, Clock, CheckCircle2, Zap, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Incident = Database["public"]["Tables"]["incidents"]["Row"];

export const Route = createFileRoute("/incidents")({
  head: () => ({ meta: [{ title: "Incident & CAPA — QEHS Live" }] }),
  component: Incidents,
});

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  incident_type: z.enum(["injury", "near-miss", "spill", "property-damage", "other"]),
  location: z.string().trim().max(200).optional().nullable(),
  status: z.enum(["open", "in-progress", "closed"]),
});

const sevTone: Record<string, string> = {
  low: "bg-success-soft text-success",
  medium: "bg-warning-soft text-warning-foreground",
  high: "bg-warning-soft text-warning-foreground",
  critical: "bg-destructive-soft text-destructive",
};

function Incidents() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Incident | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("incidents").select("*").order("occurred_at", { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (r: Incident) => { setEditing(r); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      title: fd.get("title"),
      description: fd.get("description") || null,
      severity: fd.get("severity"),
      incident_type: fd.get("incident_type"),
      location: fd.get("location") || null,
      status: fd.get("status"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (editing) {
      const { error } = await supabase.from("incidents").update(parsed.data).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Incident updated");
    } else {
      const { error } = await supabase.from("incidents").insert({ ...parsed.data, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Incident reported");
    }
    setDialogOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("incidents").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Incident deleted");
    setDeleteId(null);
    void load();
  };

  const counts = {
    open: rows.filter((r) => r.status === "open").length,
    inProg: rows.filter((r) => r.status === "in-progress").length,
    closed: rows.filter((r) => r.status === "closed").length,
    nearMiss: rows.filter((r) => r.incident_type === "near-miss").length,
  };

  return (
    <AppShell title="Incident & CAPA" subtitle="Report, investigate, and close out incidents"
      actions={<Button size="sm" className="gap-1.5" onClick={openCreate} data-toast-handled="1"><Plus className="h-4 w-4"/>Report Incident</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Open" value={counts.open} icon={AlertTriangle} tone="warning"/>
        <KpiCard label="In Progress" value={counts.inProg} icon={Clock} tone="info"/>
        <KpiCard label="Closed" value={counts.closed} icon={CheckCircle2} tone="success"/>
        <KpiCard label="Near Miss" value={counts.nearMiss} icon={Zap} tone="info"/>
      </div>

      <Section title="Incident Register" description="All reported events">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-2.5 font-medium">Title</th>
                <th className="py-2.5 font-medium">Type</th>
                <th className="py-2.5 font-medium">Severity</th>
                <th className="py-2.5 font-medium">Location</th>
                <th className="py-2.5 font-medium">Occurred</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No incidents reported.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{r.title}</td>
                  <td className="py-3 text-muted-foreground capitalize">{r.incident_type.replace("-", " ")}</td>
                  <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${sevTone[r.severity]}`}>{r.severity}</span></td>
                  <td className="py-3 text-muted-foreground">{r.location ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{new Date(r.occurred_at).toLocaleDateString()}</td>
                  <td className="py-3"><StatusBadge status={r.status as "open" | "in-progress" | "closed"}/></td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)} data-toast-handled="1"><Pencil className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)} data-toast-handled="1"><Trash2 className="h-4 w-4"/></Button>
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
        title={editing ? "Edit Incident" : "Report Incident"}
        description="Capture what happened. Be specific about location and immediate actions."
        onSubmit={handleSubmit}
        busy={busy}
        submitLabel={editing ? "Save changes" : "Submit report"}
      >
        <div className="space-y-1.5">
          <Label htmlFor="i-title">Title</Label>
          <Input id="i-title" name="title" required defaultValue={editing?.title ?? ""} placeholder="Driver slipped on diesel spill"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="i-type">Type</Label>
            <Select name="incident_type" defaultValue={editing?.incident_type ?? "near-miss"}>
              <SelectTrigger id="i-type"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="injury">Injury</SelectItem>
                <SelectItem value="near-miss">Near Miss</SelectItem>
                <SelectItem value="spill">Spill</SelectItem>
                <SelectItem value="property-damage">Property Damage</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-sev">Severity</Label>
            <Select name="severity" defaultValue={editing?.severity ?? "low"}>
              <SelectTrigger id="i-sev"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="i-loc">Location</Label>
            <Input id="i-loc" name="location" defaultValue={editing?.location ?? ""} placeholder="Yard B — Bay 4"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-status">Status</Label>
            <Select name="status" defaultValue={editing?.status ?? "open"}>
              <SelectTrigger id="i-status"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="i-desc">Description</Label>
          <Textarea id="i-desc" name="description" defaultValue={editing?.description ?? ""} placeholder="What happened, who was involved, immediate response…" className="min-h-[80px]"/>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        busy={busy}
        title="Delete incident?"
      />
    </AppShell>
  );
}
