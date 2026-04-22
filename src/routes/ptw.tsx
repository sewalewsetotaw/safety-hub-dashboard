import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileSignature, CheckCircle2, Clock, AlertTriangle, Plus } from "lucide-react";

export const Route = createFileRoute("/ptw")({
  head: () => ({ meta: [{ title: "Permit to Work — QEHS Live" }] }),
  component: PTW,
});

const permits = [
  { id:"PTW-7821", type:"Hot Work", site:"Bay 4", expires:"in 2h 14m", status:"approved" as const },
  { id:"PTW-7820", type:"Confined Space", site:"Tank 7", expires:"in 6h", status:"approved" as const },
  { id:"PTW-7819", type:"Excavation", site:"North Plot", expires:"Pending review", status:"pending" as const },
  { id:"PTW-7815", type:"Working at Height", site:"Roof A", expires:"Expired 1h ago", status:"expired" as const },
];

function PTW() {
  return (
    <AppShell title="Permit to Work" subtitle="Issue, approve, and track high-risk work permits"
      actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4"/>New Permit</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active Permits" value={32} icon={FileSignature} tone="primary"/>
        <KpiCard label="Awaiting Approval" value={7} icon={Clock} tone="warning"/>
        <KpiCard label="Expiring Today" value={5} icon={AlertTriangle} tone="destructive"/>
        <KpiCard label="Issued (30d)" value={184} icon={CheckCircle2} tone="success"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="New Permit" description="Hot Work — Bay 4">
          <form className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {["Hot Work","Confined Space","Heights","Excavation"].map((t,i)=>(
                  <button key={t} type="button" className={`text-xs py-2 rounded-md border ${i===0?"bg-primary-soft border-primary text-primary font-medium":"border-border"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium text-muted-foreground">Start</label><Input className="mt-1 h-9" defaultValue="08:00"/></div>
              <div><label className="text-xs font-medium text-muted-foreground">End</label><Input className="mt-1 h-9" defaultValue="16:00"/></div>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground">Location</label><Input className="mt-1 h-9" defaultValue="Bay 4 — Welding Booth"/></div>
            <div><label className="text-xs font-medium text-muted-foreground">Hazards & Controls</label><Textarea className="mt-1 min-h-[70px]" defaultValue="Fire watch, screens, extinguisher staged"/></div>
            <Button className="w-full">Submit for Approval</Button>
          </form>
        </Section>

        <Section title="Approval Workflow" description="PTW-7821 progress">
          <ol className="space-y-3">
            {[
              ["Requestor","done","M. Hassan · Submitted 2h ago"],
              ["Area Supervisor","done","S. Karim · Approved"],
              ["Safety Officer","current","Awaiting review"],
              ["Permit Issuer","pending","—"],
              ["Active","pending","—"],
            ].map(([t,s,note]:any,i)=>(
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${s==="done"?"bg-success text-success-foreground":s==="current"?"bg-primary text-primary-foreground ring-4 ring-primary-soft":"bg-muted text-muted-foreground"}`}>{i+1}</div>
                  {i<4 && <div className={`w-px flex-1 my-1 ${s==="done"?"bg-success":"bg-border"}`}/>}
                </div>
                <div className="pb-3"><div className="text-sm font-medium">{t}</div><div className="text-xs text-muted-foreground">{note}</div></div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Active Permits">
          <div className="divide-y divide-border">
            {permits.map(p=>(
              <div key={p.id} className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-muted-foreground">{p.id}</span>
                  <StatusBadge status={p.status}/>
                </div>
                <div className="text-sm font-medium">{p.type}</div>
                <div className="text-xs text-muted-foreground">{p.site} · {p.expires}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
