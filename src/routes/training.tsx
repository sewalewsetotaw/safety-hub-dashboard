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
import { GraduationCap, CheckCircle2, AlertCircle, Calendar, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Record = Database["public"]["Tables"]["training_records"]["Row"];

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Training — QEHS Live" }] }),
  component: Training,
});

const schema = z.object({
  employee_name: z.string().trim().min(1).max(100),
  course: z.string().trim().min(1).max(200),
  provider: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["pending", "in-progress", "approved", "expired"]),
  completed_at: z.string().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  score: z.coerce.number().min(0).max(100).optional().nullable(),
});

function Training() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("training_records").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const score = fd.get("score");
    const parsed = schema.safeParse({
      employee_name: fd.get("employee_name"), course: fd.get("course"),
      provider: fd.get("provider") || null, status: fd.get("status"),
      completed_at: fd.get("completed_at") || null,
      expires_at: fd.get("expires_at") || null,
      score: score ? score : null,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (editing) {
      const { error } = await supabase.from("training_records").update(parsed.data).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Record updated");
    } else {
      const { error } = await supabase.from("training_records").insert({ ...parsed.data, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Training record added");
    }
    setDialogOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("training_records").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setDeleteId(null);
    void load();
  };

  const counts = {
    completed: rows.filter(r => r.status === "approved").length,
    upcoming: rows.filter(r => r.status === "pending" || r.status === "in-progress").length,
    expired: rows.filter(r => r.status === "expired").length,
  };

  return (
    <AppShell title="Training & Competency" subtitle="Certifications, refreshers, and qualifications"
      actions={<Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setDialogOpen(true); }} data-toast-handled="1"><Plus className="h-4 w-4"/>Add Record</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Completed" value={counts.completed} icon={CheckCircle2} tone="success"/>
        <KpiCard label="In Progress" value={counts.upcoming} icon={Calendar} tone="warning"/>
        <KpiCard label="Expired" value={counts.expired} icon={AlertCircle} tone="destructive"/>
        <KpiCard label="Total" value={rows.length} icon={GraduationCap} tone="primary"/>
      </div>

      <Section title="Training Records">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="px-5 py-2.5 font-medium">Employee</th><th className="py-2.5 font-medium">Course</th>
              <th className="py-2.5 font-medium">Provider</th><th className="py-2.5 font-medium">Completed</th>
              <th className="py-2.5 font-medium">Expires</th><th className="py-2.5 font-medium">Score</th>
              <th className="py-2.5 font-medium">Status</th><th className="px-5 py-2.5 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No training records yet.</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{r.employee_name}</td>
                  <td className="py-3">{r.course}</td>
                  <td className="py-3 text-muted-foreground">{r.provider ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{r.completed_at ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{r.expires_at ?? "—"}</td>
                  <td className="py-3 font-medium">{r.score ?? "—"}</td>
                  <td className="py-3"><StatusBadge status={r.status as "pending" | "in-progress" | "approved" | "expired"}/></td>
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
        title={editing ? "Edit Training Record" : "Add Training Record"}
        onSubmit={handleSubmit} busy={busy} submitLabel={editing ? "Save changes" : "Create"}>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="employee_name">Employee</Label>
            <Input id="employee_name" name="employee_name" required defaultValue={editing?.employee_name ?? ""} placeholder="M. Hassan"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="course">Course</Label>
            <Input id="course" name="course" required defaultValue={editing?.course ?? ""} placeholder="Working at Heights"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="provider">Provider</Label>
            <Input id="provider" name="provider" defaultValue={editing?.provider ?? ""} placeholder="NEBOSH"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={editing?.status ?? "pending"}>
              <SelectTrigger id="status"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="approved">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="completed_at">Completed</Label>
            <Input id="completed_at" name="completed_at" type="date" defaultValue={editing?.completed_at ?? ""}/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expires_at">Expires</Label>
            <Input id="expires_at" name="expires_at" type="date" defaultValue={editing?.expires_at ?? ""}/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="score">Score</Label>
            <Input id="score" name="score" type="number" min="0" max="100" defaultValue={editing?.score ?? ""}/>
          </div>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete} busy={busy} title="Delete training record?"/>
    </AppShell>
  );
}
