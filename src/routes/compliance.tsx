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
import { ShieldCheck, AlertCircle, CheckCircle2, FileCheck, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Item = Database["public"]["Tables"]["compliance_items"]["Row"];

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [{ title: "Compliance — QEHS Live" }] }),
  component: Compliance,
});

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  framework: z.string().trim().min(1).max(100),
  clause: z.string().trim().max(50).optional().nullable(),
  owner: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["pending", "in-progress", "approved", "expired", "rejected"]),
  due_date: z.string().optional().nullable(),
  evidence_url: z.string().trim().max(500).optional().nullable(),
});

function Compliance() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("compliance_items").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      title: fd.get("title"), framework: fd.get("framework"),
      clause: fd.get("clause") || null, owner: fd.get("owner") || null,
      status: fd.get("status"), due_date: fd.get("due_date") || null,
      evidence_url: fd.get("evidence_url") || null,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (editing) {
      const { error } = await supabase.from("compliance_items").update(parsed.data).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      const { error } = await supabase.from("compliance_items").insert({ ...parsed.data, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Compliance item added");
    }
    setDialogOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("compliance_items").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setDeleteId(null);
    void load();
  };

  const counts = {
    approved: rows.filter(r => r.status === "approved").length,
    pending: rows.filter(r => r.status === "pending" || r.status === "in-progress").length,
    expired: rows.filter(r => r.status === "expired").length,
  };

  return (
    <AppShell title="Compliance" subtitle="Frameworks, clauses, and certification evidence"
      actions={<Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setDialogOpen(true); }} data-toast-handled="1"><Plus className="h-4 w-4"/>Add Item</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Approved" value={counts.approved} icon={CheckCircle2} tone="success"/>
        <KpiCard label="In Progress" value={counts.pending} icon={FileCheck} tone="warning"/>
        <KpiCard label="Expired" value={counts.expired} icon={AlertCircle} tone="destructive"/>
        <KpiCard label="Total Items" value={rows.length} icon={ShieldCheck} tone="primary"/>
      </div>

      <Section title="Compliance Register">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="px-5 py-2.5 font-medium">Title</th><th className="py-2.5 font-medium">Framework</th>
              <th className="py-2.5 font-medium">Clause</th><th className="py-2.5 font-medium">Owner</th>
              <th className="py-2.5 font-medium">Due</th><th className="py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No compliance items yet.</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{r.title}</td>
                  <td className="py-3 text-muted-foreground">{r.framework}</td>
                  <td className="py-3">{r.clause ?? "—"}</td>
                  <td className="py-3">{r.owner ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{r.due_date ?? "—"}</td>
                  <td className="py-3"><StatusBadge status={r.status as "pending" | "in-progress" | "approved" | "expired" | "rejected"}/></td>
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
        title={editing ? "Edit Compliance Item" : "Add Compliance Item"}
        onSubmit={handleSubmit} busy={busy} submitLabel={editing ? "Save changes" : "Create"}>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={editing?.title ?? ""} placeholder="Annual fire drill report"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="framework">Framework</Label>
            <Input id="framework" name="framework" required defaultValue={editing?.framework ?? "ISO 45001"}/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clause">Clause</Label>
            <Input id="clause" name="clause" defaultValue={editing?.clause ?? ""} placeholder="8.2"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" name="owner" defaultValue={editing?.owner ?? ""} placeholder="QHSE Manager"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due_date">Due date</Label>
            <Input id="due_date" name="due_date" type="date" defaultValue={editing?.due_date ?? ""}/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={editing?.status ?? "pending"}>
              <SelectTrigger id="status"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="evidence_url">Evidence URL</Label>
            <Input id="evidence_url" name="evidence_url" defaultValue={editing?.evidence_url ?? ""} placeholder="https://…"/>
          </div>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete} busy={busy} title="Delete compliance item?"/>
    </AppShell>
  );
}
