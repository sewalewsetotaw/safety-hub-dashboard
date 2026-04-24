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
import { Building2, CheckCircle2, AlertCircle, Award, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Sub = Database["public"]["Tables"]["subcontractors"]["Row"];

export const Route = createFileRoute("/subcontractors")({
  head: () => ({ meta: [{ title: "Subcontractors — QEHS Live" }] }),
  component: Subcontractors,
});

const schema = z.object({
  company_name: z.string().trim().min(1).max(200),
  trade: z.string().trim().max(100).optional().nullable(),
  contact_name: z.string().trim().max(100).optional().nullable(),
  contact_email: z.string().trim().email().max(200).optional().or(z.literal("")).nullable(),
  status: z.enum(["pending", "approved", "rejected", "expired"]),
  prequalified_until: z.string().optional().nullable(),
  safety_score: z.coerce.number().min(0).max(100).optional().nullable(),
});

function Subcontractors() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Sub | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("subcontractors").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const score = fd.get("safety_score");
    const parsed = schema.safeParse({
      company_name: fd.get("company_name"), trade: fd.get("trade") || null,
      contact_name: fd.get("contact_name") || null,
      contact_email: fd.get("contact_email") || null,
      status: fd.get("status"),
      prequalified_until: fd.get("prequalified_until") || null,
      safety_score: score ? score : null,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    const payload = { ...parsed.data, contact_email: parsed.data.contact_email || null };
    setBusy(true);
    if (editing) {
      const { error } = await supabase.from("subcontractors").update(payload).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Subcontractor updated");
    } else {
      const { error } = await supabase.from("subcontractors").insert({ ...payload, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Subcontractor added");
    }
    setDialogOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("subcontractors").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setDeleteId(null);
    void load();
  };

  const counts = {
    approved: rows.filter(r => r.status === "approved").length,
    pending: rows.filter(r => r.status === "pending").length,
    expired: rows.filter(r => r.status === "expired").length,
  };

  return (
    <AppShell title="Subcontractors" subtitle="Pre-qualification, performance, and safety scoring"
      actions={<Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setDialogOpen(true); }} data-toast-handled="1"><Plus className="h-4 w-4"/>Add Subcontractor</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Approved" value={counts.approved} icon={CheckCircle2} tone="success"/>
        <KpiCard label="Pending" value={counts.pending} icon={AlertCircle} tone="warning"/>
        <KpiCard label="Expired" value={counts.expired} icon={AlertCircle} tone="destructive"/>
        <KpiCard label="Total" value={rows.length} icon={Building2} tone="primary"/>
      </div>

      <Section title="Subcontractor Register">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="px-5 py-2.5 font-medium">Company</th><th className="py-2.5 font-medium">Trade</th>
              <th className="py-2.5 font-medium">Contact</th><th className="py-2.5 font-medium">Pre-Qual Until</th>
              <th className="py-2.5 font-medium">Safety</th><th className="py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No subcontractors registered.</td></tr>
              ) : rows.map(s => (
                <tr key={s.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{s.company_name}</td>
                  <td className="py-3 text-muted-foreground">{s.trade ?? "—"}</td>
                  <td className="py-3">{s.contact_name ?? "—"}{s.contact_email && <div className="text-xs text-muted-foreground">{s.contact_email}</div>}</td>
                  <td className="py-3 text-muted-foreground">{s.prequalified_until ?? "—"}</td>
                  <td className="py-3 font-medium">{s.safety_score != null ? <span className="inline-flex items-center gap-1"><Award className="h-3 w-3"/>{s.safety_score}</span> : "—"}</td>
                  <td className="py-3"><StatusBadge status={s.status as "pending" | "approved" | "rejected" | "expired"}/></td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(s); setDialogOpen(true); }} data-toast-handled="1"><Pencil className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(s.id)} data-toast-handled="1"><Trash2 className="h-4 w-4"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? "Edit Subcontractor" : "Add Subcontractor"}
        onSubmit={handleSubmit} busy={busy} submitLabel={editing ? "Save changes" : "Create"}>
        <div className="space-y-1.5">
          <Label htmlFor="company_name">Company name</Label>
          <Input id="company_name" name="company_name" required defaultValue={editing?.company_name ?? ""} placeholder="ACME Construction"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="trade">Trade</Label>
            <Input id="trade" name="trade" defaultValue={editing?.trade ?? ""} placeholder="Electrical"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">Contact name</Label>
            <Input id="contact_name" name="contact_name" defaultValue={editing?.contact_name ?? ""} placeholder="J. Smith"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="contact_email">Contact email</Label>
            <Input id="contact_email" name="contact_email" type="email" defaultValue={editing?.contact_email ?? ""} placeholder="ops@acme.com"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prequalified_until">Pre-qualified until</Label>
            <Input id="prequalified_until" name="prequalified_until" type="date" defaultValue={editing?.prequalified_until ?? ""}/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={editing?.status ?? "pending"}>
              <SelectTrigger id="status"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="safety_score">Safety score (0-100)</Label>
            <Input id="safety_score" name="safety_score" type="number" min="0" max="100" defaultValue={editing?.safety_score ?? ""}/>
          </div>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete} busy={busy} title="Delete subcontractor?"/>
    </AppShell>
  );
}
