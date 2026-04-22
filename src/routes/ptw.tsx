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
import { FileSignature, CheckCircle2, Clock, AlertTriangle, Plus, Pencil, Trash2, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Permit = Database["public"]["Tables"]["permits"]["Row"];

export const Route = createFileRoute("/ptw")({
  head: () => ({ meta: [{ title: "Permit to Work — QEHS Live" }] }),
  component: PTW,
});

const schema = z.object({
  permit_number: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(200),
  permit_type: z.enum(["hot-work", "confined-space", "heights", "excavation", "general"]),
  location: z.string().trim().max(200).optional().nullable(),
  contractor: z.string().trim().max(150).optional().nullable(),
  status: z.enum(["pending", "approved", "rejected", "closed"]),
  valid_from: z.string().optional().nullable(),
  valid_until: z.string().optional().nullable(),
});

function PTW() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Permit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("permits").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (r: Permit) => { setEditing(r); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      permit_number: fd.get("permit_number"),
      title: fd.get("title"),
      permit_type: fd.get("permit_type"),
      location: fd.get("location") || null,
      contractor: fd.get("contractor") || null,
      status: fd.get("status"),
      valid_from: fd.get("valid_from") || null,
      valid_until: fd.get("valid_until") || null,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (editing) {
      const { error } = await supabase.from("permits").update(parsed.data).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Permit updated");
    } else {
      const { error } = await supabase.from("permits").insert({ ...parsed.data, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Permit submitted");
    }
    setDialogOpen(false);
    void load();
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("permits").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Permit ${status}`);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("permits").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Permit deleted");
    setDeleteId(null);
    void load();
  };

  const counts = {
    active: rows.filter((r) => r.status === "approved").length,
    pending: rows.filter((r) => r.status === "pending").length,
    expiring: rows.filter((r) => r.valid_until && new Date(r.valid_until).getTime() - Date.now() < 86400000 && r.status === "approved").length,
    closed: rows.filter((r) => r.status === "closed").length,
  };

  return (
    <AppShell title="Permit to Work" subtitle="Issue, approve, and track high-risk work permits"
      actions={<Button size="sm" className="gap-1.5" onClick={openCreate} data-toast-handled="1"><Plus className="h-4 w-4"/>New Permit</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active" value={counts.active} icon={FileSignature} tone="primary"/>
        <KpiCard label="Pending" value={counts.pending} icon={Clock} tone="warning"/>
        <KpiCard label="Expiring (24h)" value={counts.expiring} icon={AlertTriangle} tone="destructive"/>
        <KpiCard label="Closed" value={counts.closed} icon={CheckCircle2} tone="success"/>
      </div>

      <Section title="Permit Register">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-2.5 font-medium">Number</th>
                <th className="py-2.5 font-medium">Title</th>
                <th className="py-2.5 font-medium">Type</th>
                <th className="py-2.5 font-medium">Location</th>
                <th className="py-2.5 font-medium">Valid</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No permits issued.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-mono text-xs">{r.permit_number}</td>
                  <td className="py-3 font-medium">{r.title}</td>
                  <td className="py-3 text-muted-foreground capitalize">{r.permit_type.replace("-", " ")}</td>
                  <td className="py-3 text-muted-foreground">{r.location ?? "—"}</td>
                  <td className="py-3 text-muted-foreground text-xs">{r.valid_from ?? "—"} → {r.valid_until ?? "—"}</td>
                  <td className="py-3"><StatusBadge status={r.status as "pending" | "approved" | "rejected" | "closed"}/></td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    {r.status === "pending" && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => updateStatus(r.id, "approved")} data-toast-handled="1" title="Approve"><ThumbsUp className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateStatus(r.id, "rejected")} data-toast-handled="1" title="Reject"><ThumbsDown className="h-4 w-4"/></Button>
                      </>
                    )}
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
        title={editing ? "Edit Permit" : "New Permit"}
        description="High-risk work requires a permit. Fill in scope, location, and validity."
        onSubmit={handleSubmit}
        busy={busy}
        submitLabel={editing ? "Save changes" : "Submit for approval"}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-num">Permit number</Label>
            <Input id="p-num" name="permit_number" required defaultValue={editing?.permit_number ?? `PTW-${Math.floor(Math.random()*9000+1000)}`}/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-type">Type</Label>
            <Select name="permit_type" defaultValue={editing?.permit_type ?? "hot-work"}>
              <SelectTrigger id="p-type"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="hot-work">Hot Work</SelectItem>
                <SelectItem value="confined-space">Confined Space</SelectItem>
                <SelectItem value="heights">Working at Heights</SelectItem>
                <SelectItem value="excavation">Excavation</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-title">Title</Label>
          <Input id="p-title" name="title" required defaultValue={editing?.title ?? ""} placeholder="Welding repair on Tank 7 manifold"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-loc">Location</Label>
            <Input id="p-loc" name="location" defaultValue={editing?.location ?? ""} placeholder="Bay 4"/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-cont">Contractor</Label>
            <Input id="p-cont" name="contractor" defaultValue={editing?.contractor ?? ""} placeholder="Acme Welding"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-from">Valid from</Label>
            <Input id="p-from" name="valid_from" type="date" defaultValue={editing?.valid_from ?? ""}/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-until">Valid until</Label>
            <Input id="p-until" name="valid_until" type="date" defaultValue={editing?.valid_until ?? ""}/>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-status">Status</Label>
          <Select name="status" defaultValue={editing?.status ?? "pending"}>
            <SelectTrigger id="p-status"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        busy={busy}
        title="Delete permit?"
      />
    </AppShell>
  );
}
