import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSearch, CalendarCheck, AlertCircle, CheckCircle2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/audits")({
  head: () => ({ meta: [{ title: "Audit Management — QEHS Live" }] }),
  component: Audits,
});

const days = Array.from({length:35}, (_,i)=>i-2);
const events: Record<number, {label:string;tone:string}> = {
  4: {label:"ISO 9001",tone:"primary"}, 9:{label:"HSE Walk",tone:"success"},
  14:{label:"Internal",tone:"info"}, 17:{label:"Vendor",tone:"warning"},
  22:{label:"ISO 45001",tone:"primary"}, 28:{label:"Site Audit",tone:"info"},
};
const findings = [
  { id:"F-204", title:"Missing fire extinguisher inspection tag — Bay 3", sev:"Major", tone:"destructive" },
  { id:"F-205", title:"PPE storage not labeled per standard", sev:"Minor", tone:"warning" },
  { id:"F-206", title:"Emergency assembly point signage faded", sev:"Minor", tone:"warning" },
  { id:"F-207", title:"Excellent housekeeping — Yard A", sev:"Observation", tone:"success" },
];

function Audits() {
  return (
    <AppShell title="Audit Management" subtitle="Plan, execute, and close audit findings"
      actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4"/>Schedule Audit</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Scheduled" value={24} icon={CalendarCheck} tone="primary"/>
        <KpiCard label="Completed YTD" value={89} icon={CheckCircle2} tone="success"/>
        <KpiCard label="Open Findings" value={47} icon={AlertCircle} tone="warning"/>
        <KpiCard label="Audits Live" value={3} icon={FileSearch} tone="info"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Audit Calendar" description="April 2026" className="lg:col-span-2"
          action={<div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4"/></Button></div>}>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {["S","M","T","W","T","F","S"].map(d=><div key={d} className="text-center text-muted-foreground py-1">{d}</div>)}
            {days.map((d,i)=>{
              const valid = d>=1 && d<=30;
              const ev = events[d];
              return (
                <div key={i} className={`min-h-[64px] rounded-md border p-1.5 ${valid?"border-border bg-card":"border-transparent"}`}>
                  {valid && <div className="text-[10px] text-muted-foreground">{d}</div>}
                  {ev && <div className={`mt-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-${ev.tone}-soft text-${ev.tone === "primary"?"primary":ev.tone}`}>{ev.label}</div>}
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Audit Execution" description="ISO 45001 — Yard B">
          <div className="text-xs mb-2 flex justify-between"><span className="text-muted-foreground">Progress</span><span className="font-medium">14 / 32 items</span></div>
          <div className="h-2 rounded-full bg-border mb-4 overflow-hidden"><div className="h-full bg-primary" style={{width:"43%"}}/></div>
          {["Leadership commitment evidenced","Hazard ID procedure current","Worker consultation records","PPE program documented"].map((q,i)=>(
            <div key={i} className="flex items-start gap-3 py-2.5 border-t border-border">
              <div className={`h-5 w-5 rounded shrink-0 mt-0.5 ${i<3?"bg-success":"border-2 border-border"} flex items-center justify-center`}>{i<3 && <CheckCircle2 className="h-3 w-3 text-success-foreground"/>}</div>
              <div className="flex-1 text-sm">{q}</div>
            </div>
          ))}
          <Button size="sm" variant="outline" className="w-full mt-3">Continue Audit</Button>
        </Section>
      </div>

      <Section title="Recent Findings" className="mt-4">
        <div className="divide-y divide-border">
          {findings.map(f=>(
            <div key={f.id} className="flex items-center gap-3 py-3">
              <span className="text-xs text-muted-foreground font-mono w-16">{f.id}</span>
              <span className="flex-1 text-sm">{f.title}</span>
              <Badge variant="outline" className={`bg-${f.tone}-soft text-${f.tone === "warning" ? "warning-foreground" : f.tone} border-${f.tone}/20`}>{f.sev}</Badge>
            </div>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
