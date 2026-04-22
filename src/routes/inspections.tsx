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
import { ClipboardCheck, CheckCircle2, AlertOctagon, Clock, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Inspection = Database["public"]["Tables"]["inspections"]["Row"];

export const Route = createFileRoute("/inspections")({
  head: () => ({ meta: [{ title: "Site Inspections — QEHS Live" }] }),
  component: Inspections,
});

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  inspection_type: z.enum(["site", "vehicle", "equipment", "ppe", "other"]),
  location: z.string().trim().max(200).optional().nullable(),
  score: z.number().int().min(0).max(100).optional().nullable(),
  status: z.enum(["pending", "in-progress", "closed", "overdue"]),
  due_date: z.string().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

function Inspections() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Inspection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("inspections").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (r: Inspection) => { setEditing(r); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const scoreRaw = fd.get("score");
    const parsed = schema.safeParse({
      title: fd.get("title"),
      inspection_type: fd.get("inspection_type"),
      location: fd.get("location") || null,
      score: scoreRaw ? Number(scoreRaw) : null,
      status: fd.get("status"),
      due_date: fd.get("due_date") || null,
      notes: fd.get("notes") || null,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const payload = {
      ...parsed.data,
      completed_at: parsed.data.status === "closed" ? new Date().toISOString() : null,
    };
    if (editing) {
      const { error } = await supabase.from("inspections").update(payload).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Inspection updated");
    } else {
      const { error } = await supabase.from("inspections").insert({ ...payload, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Inspection created");
    }
    setDialogOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("inspections").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Inspection deleted");
    setDeleteId(null);
    void load();
  };

  const counts = {
    pending: rows.filter((r) => r.status === "pending").length,
    inProg: rows.filter((r) => r.status === "in-progress").length,
    closed: rows.filter((r) => r.status === "closed").length,
    overdue: rows.filter((r) => r.status === "overdue").length,
  };

  return (
    <AppShell title="Site Inspections" subtitle="Plan, run, and close out site, vehicle and equipment inspections"
      actions={<Button size="sm" className="gap-1.5" onClick={openCreate} data-toast-handled="1"><Plus className="h-4 w-4"/>New Inspection</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Pending" value={counts.pending} icon={Clock} tone="warning"/>
        <KpiCard label="In Progress" value={counts.inProg} icon={ClipboardCheck} tone="info"/>
        <KpiCard label="Closed" value={counts.closed} icon={CheckCircle2} tone="success"/>
        <KpiCard label="Overdue" value={counts.overdue} icon={AlertOctagon} tone="destructive"/>
      </div>

      <Section title="Inspections">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-2.5 font-medium">Title</th>
                <th className="py-2.5 font-medium">Type</th>
                <th className="py-2.5 font-medium">Location</th>
                <th className="py-2.5 font-medium">Score</th>
                <th className="py-2.5 font-medium">Due</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No inspections yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{r.title}</td>
                  <td className="py-3 text-muted-foreground capitalize">{r.inspection_type}</td>
                  <td className="py-3 text-muted-foreground">{r.location ?? "—"}</td>
                  <td className="py-3"><span className="font-medium">{r.score ?? "—"}{r.score !== null ? "%" : ""}</span></td>
                  <td className="py-3 text-muted-foreground">{r.due_date ?? "—"}</td>
                  <td className="py-3"><StatusBadge status={r.status as "pending" | "in-progress" | "closed" | "overdue"}/></td>
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
        title={editing ? "Edit Inspection" : "New Inspection"}
        onSubmit={handleSubmit}
        busy={busy}
        submitLabel={editing ? "Save changes" : "Create"}
      >
        <div className="space-y-1.5">
          <Label htmlFor="ins-title">Title</Label>
          <Input id="ins-title" name="title" required defaultValue={editing?.title ?? ""} placeholder="Yard B — daily PPE check"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ins-type">Type</Label>
            <Select name="inspection_type" defaultValue={editing?.inspection_type ?? "site"}>
              <SelectTrigger id="ins-type"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="ppe">PPE</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ins-status">Status</Label>
            <Select name="status" defaultValue={editing?.status ?? "pending"}>
              <SelectTrigger id="ins-status"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="ins-loc">Location</Label>
            <Input id="ins-loc" name="location" defaultValue={editing?.location ?? ""} placeholder="Yard B"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ins-score">Score (%)</Label>
            <Input id="ins-score" name="score" type="number" min={0} max={100} defaultValue={editing?.score ?? ""}/>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ins-due">Due date</Label>
          <Input id="ins-due" name="due_date" type="date" defaultValue={editing?.due_date ?? ""}/>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ins-notes">Notes</Label>
          <Textarea id="ins-notes" name="notes" defaultValue={editing?.notes ?? ""} className="min-h-[70px]"/>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        busy={busy}
        title="Delete inspection?"
      />
    </AppShell>
  );
}
