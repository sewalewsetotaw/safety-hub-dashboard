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
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Risk = Database["public"]["Tables"]["risk_register"]["Row"];

export const Route = createFileRoute("/risk")({
  head: () => ({ meta: [{ title: "Risk Register — QEHS Live" }] }),
  component: RiskPage,
});

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(50),
  likelihood: z.coerce.number().min(1).max(5),
  impact: z.coerce.number().min(1).max(5),
  mitigation: z.string().trim().max(1000).optional().nullable(),
  owner: z.string().trim().max(100).optional().nullable(),
  status: z.enum(["open", "in-progress", "closed"]),
});

function scoreColor(score: number): "success" | "warning" | "destructive" {
  if (score >= 15) return "destructive";
  if (score >= 8) return "warning";
  return "success";
}

function RiskPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Risk | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("risk_register").select("*").order("score", { ascending: false });
    if (error) toast.error(error.message); else setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("Not signed in");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      title: fd.get("title"), category: fd.get("category"),
      likelihood: fd.get("likelihood"), impact: fd.get("impact"),
      mitigation: fd.get("mitigation") || null, owner: fd.get("owner") || null,
      status: fd.get("status"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (editing) {
      const { error } = await supabase.from("risk_register").update(parsed.data).eq("id", editing.id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Risk updated");
    } else {
      const { error } = await supabase.from("risk_register").insert({ ...parsed.data, created_by: user.id });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Risk added");
    }
    setDialogOpen(false);
    void load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const { error } = await supabase.from("risk_register").delete().eq("id", deleteId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setDeleteId(null);
    void load();
  };

  const high = rows.filter(r => (r.score ?? 0) >= 15).length;
  const medium = rows.filter(r => (r.score ?? 0) >= 8 && (r.score ?? 0) < 15).length;
  const closed = rows.filter(r => r.status === "closed").length;

  return (
    <AppShell title="Risk Register" subtitle="Identify, assess, and mitigate operational risks"
      actions={<Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setDialogOpen(true); }} data-toast-handled="1"><Plus className="h-4 w-4"/>Add Risk</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="High Risk" value={high} icon={ShieldAlert} tone="destructive"/>
        <KpiCard label="Medium Risk" value={medium} icon={AlertTriangle} tone="warning"/>
        <KpiCard label="Closed" value={closed} icon={CheckCircle2} tone="success"/>
        <KpiCard label="Total" value={rows.length} icon={TrendingUp} tone="primary"/>
      </div>

      <Section title="Risk Register">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="px-5 py-2.5 font-medium">Title</th><th className="py-2.5 font-medium">Category</th>
              <th className="py-2.5 font-medium">L × I</th><th className="py-2.5 font-medium">Score</th>
              <th className="py-2.5 font-medium">Owner</th><th className="py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No risks logged yet.</td></tr>
              ) : rows.map(r => {
                const tone = scoreColor(r.score ?? 0);
                return (
                  <tr key={r.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium">{r.title}</td>
                    <td className="py-3 text-muted-foreground">{r.category}</td>
                    <td className="py-3">{r.likelihood} × {r.impact}</td>
                    <td className="py-3"><span className={`inline-flex items-center justify-center min-w-8 h-6 px-2 rounded text-xs font-semibold bg-${tone}-soft text-${tone === "warning" ? "warning-foreground" : tone}`}>{r.score}</span></td>
                    <td className="py-3">{r.owner ?? "—"}</td>
                    <td className="py-3"><StatusBadge status={r.status as "open" | "in-progress" | "closed"}/></td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(r); setDialogOpen(true); }} data-toast-handled="1"><Pencil className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)} data-toast-handled="1"><Trash2 className="h-4 w-4"/></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen}
        title={editing ? "Edit Risk" : "Add Risk"}
        description="Score = Likelihood × Impact (calculated automatically)."
        onSubmit={handleSubmit} busy={busy} submitLabel={editing ? "Save changes" : "Create"}>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={editing?.title ?? ""} placeholder="Crane operation near power lines"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue={editing?.category ?? "operational"}>
              <SelectTrigger id="category"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="environmental">Environmental</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={editing?.status ?? "open"}>
              <SelectTrigger id="status"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="likelihood">Likelihood (1-5)</Label>
            <Input id="likelihood" name="likelihood" type="number" min="1" max="5" required defaultValue={editing?.likelihood ?? 1}/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="impact">Impact (1-5)</Label>
            <Input id="impact" name="impact" type="number" min="1" max="5" required defaultValue={editing?.impact ?? 1}/>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" name="owner" defaultValue={editing?.owner ?? ""} placeholder="Site Manager"/>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mitigation">Mitigation</Label>
          <Input id="mitigation" name="mitigation" defaultValue={editing?.mitigation ?? ""} placeholder="Establish 5m exclusion zone…"/>
        </div>
      </CrudDialog>

      <ConfirmDeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete} busy={busy} title="Delete risk?"/>
    </AppShell>
  );
}
