import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Clock, CheckCircle2, Zap, Plus } from "lucide-react";

export const Route = createFileRoute("/incidents")({
  head: () => ({ meta: [{ title: "Incident & CAPA — QEHS Live" }] }),
  component: Incidents,
});

const capa = [
  { id: "CAPA-2041", title: "Replace damaged lifting sling", owner: "M. Hassan", due: "Overdue 8d", status: "overdue" as const },
  { id: "CAPA-2038", title: "Update HIRA — Tank Cleaning", owner: "S. Karim", due: "Overdue 5d", status: "overdue" as const },
  { id: "CAPA-2055", title: "Driver fatigue training rollout", owner: "L. Chen", due: "Due in 3d", status: "in-progress" as const },
  { id: "CAPA-2061", title: "Install secondary containment", owner: "R. Patel", due: "Due in 12d", status: "open" as const },
  { id: "CAPA-2030", title: "Forklift seatbelt audit", owner: "F. Noor", due: "Closed", status: "closed" as const },
];

function Incidents() {
  return (
    <AppShell title="Incident & CAPA" subtitle="Report, investigate, and close out corrective actions"
      actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4"/>Report Incident</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Open Incidents" value={14} icon={AlertTriangle} tone="warning"/>
        <KpiCard label="Overdue CAPA" value={9} icon={Clock} tone="destructive"/>
        <KpiCard label="Closed (30d)" value={48} icon={CheckCircle2} tone="success"/>
        <KpiCard label="Near Miss" value={31} icon={Zap} tone="info"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Quick Report" description="Capture an incident in seconds">
          <form className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {["Injury","Near Miss","Spill"].map((t,i)=>(
                  <button key={t} type="button" className={`text-xs py-2 rounded-md border ${i===0?"bg-primary-soft border-primary text-primary font-medium":"border-border"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <Input className="mt-1 h-9" placeholder="Yard B — Bay 4"/>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Severity</label>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {[["1","success"],["2","warning"],["3","warning"],["4","destructive"]].map(([n,c]:any)=>(
                  <button key={n} type="button" className={`text-xs py-2 rounded-md border border-border bg-${c}/10 text-foreground font-semibold`}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea className="mt-1 min-h-[80px]" placeholder="What happened?"/>
            </div>
            <Button className="w-full">Submit Report</Button>
          </form>
        </Section>

        <Section title="CAPA Tracker" className="lg:col-span-2"
          action={<div className="flex gap-1 text-xs">{["All","Open","In Progress","Closed"].map((t,i)=>(<button key={t} className={`px-2.5 py-1 rounded ${i===0?"bg-muted font-medium":"text-muted-foreground"}`}>{t}</button>))}</div>}>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-2.5 font-medium">ID</th>
                <th className="py-2.5 font-medium">Action</th>
                <th className="py-2.5 font-medium">Owner</th>
                <th className="py-2.5 font-medium">Due</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {capa.map(c=>(
                  <tr key={c.id} className={`hover:bg-muted/40 ${c.status==="overdue"?"bg-destructive-soft/30":""}`}>
                    <td className="px-5 py-3 font-medium">{c.id}</td>
                    <td className="py-3">{c.title}</td>
                    <td className="py-3 text-muted-foreground">{c.owner}</td>
                    <td className={`py-3 ${c.status==="overdue"?"text-destructive font-medium":"text-muted-foreground"}`}>{c.due}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
