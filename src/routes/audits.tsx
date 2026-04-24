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
import { FileSearch, CalendarCheck, AlertCircle, CheckCircle2, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Audit = Database["public"]["Tables"]["audits"]["Row"];

export const Route = createFileRoute("/audits")({
  head: () => ({ meta: [{ title: "Audit Management — QEHS Live" }] }),
  component: Audits,
});

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  audit_type: z.string().trim().min(1).max(50),
  scope: z.string().trim().max(500).optional().nullable(),
  auditor: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["planned", "in-progress", "closed", "overdue"]),
  planned_date: z.string().optional().nullable(),
});

function Audits() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Audit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("audits").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (a: Audit) => { setEditing(a); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      title: fd.get("title"),
      audit_type: fd.get("audit_type"),
      scope: fd.get("scope") || null,
      auditor: fd.get("auditor") || null,
      status: fd.get("status"),
      planned_date: fd.get("planned_date") || null,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (editing) {
      const { error } = await supabase.from("audits").update(parsed.data).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Audit updated");
    } else {
      const { error } = await supabase.from("audits").insert({ ...parsed.data, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Audit scheduled");
    }
    setDialogOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("audits").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Audit deleted");
    setDeleteId(null);
    void load();
  };

  const counts = {
    planned: rows.filter(r => r.status === "planned").length,
    inProgress: rows.filter(r => r.status === "in-progress").length,
    closed: rows.filter(r => r.status === "closed").length,
    overdue: rows.filter(r => r.status === "overdue").length,
  };

  return (
    <AppShell title="Audit Management" subtitle="Plan, execute, and close audit findings"
      actions={<Button size="sm" className="gap-1.5" onClick={openCreate} data-toast-handled="1"><Plus className="h-4 w-4"/>Schedule Audit</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Planned" value={counts.planned} icon={CalendarCheck} tone="primary"/>
        <KpiCard label="In Progress" value={counts.inProgress} icon={FileSearch} tone="info"/>
        <KpiCard label="Closed" value={counts.closed} icon={CheckCircle2} tone="success"/>
        <KpiCard label="Overdue" value={counts.overdue} icon={AlertCircle} tone="warning"/>
      </div>

      <Section title="Audit Register">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="px-5 py-2.5 font-medium">Title</th><th className="py-2.5 font-medium">Type</th>
              <th className="py-2.5 font-medium">Auditor</th><th className="py-2.5 font-medium">Planned</th>
              <th className="py-2.5 font-medium">Status</th><th className="px-5 py-2.5 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No audits scheduled yet.</td></tr>
              ) : rows.map(a => (
                <tr key={a.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{a.title}</td>
                  <td className="py-3 text-muted-foreground">{a.audit_type}</td>
                  <td className="py-3">{a.auditor ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{a.planned_date ?? "—"}</td>
                  <td className="py-3"><StatusBadge status={a.status as "planned" | "in-progress" | "closed" | "overdue"}/></td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)} data-toast-handled="1"><Pencil className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(a.id)} data-toast-handled="1"><Trash2 className="h-4 w-4"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? "Edit Audit" : "Schedule Audit"}
        description="Track audits across frameworks and sites."
        onSubmit={handleSubmit} busy={busy} submitLabel={editing ? "Save changes" : "Schedule"}>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={editing?.title ?? ""} placeholder="ISO 45001 — Yard B"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="audit_type">Type</Label>
            <Select name="audit_type" defaultValue={editing?.audit_type ?? "internal"}>
              <SelectTrigger id="audit_type"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="iso">ISO Certification</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={editing?.status ?? "planned"}>
              <SelectTrigger id="status"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="auditor">Auditor</Label>
            <Input id="auditor" name="auditor" defaultValue={editing?.auditor ?? ""} placeholder="J. Smith"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="planned_date">Planned date</Label>
            <Input id="planned_date" name="planned_date" type="date" defaultValue={editing?.planned_date ?? ""}/>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scope">Scope</Label>
          <Input id="scope" name="scope" defaultValue={editing?.scope ?? ""} placeholder="Production line, PPE compliance…"/>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete} busy={busy} title="Delete audit?"/>
    </AppShell>
  );
}
