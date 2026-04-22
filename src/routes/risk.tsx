import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Button } from "@/components/ui/button";
import { ShieldAlert, TrendingDown, AlertCircle, Plus } from "lucide-react";

export const Route = createFileRoute("/risk")({
  head: () => ({ meta: [{ title: "Risk (HIRA) — QEHS Live" }] }),
  component: Risk,
});

const risks = [
  { id: "R-118", hazard: "Working at heights — scaffolding", L: 3, S: 4, owner: "M. Hassan" },
  { id: "R-094", hazard: "Crane lifting near power lines",   L: 2, S: 5, owner: "S. Karim" },
  { id: "R-121", hazard: "Confined space entry — Tank 7",    L: 3, S: 5, owner: "L. Chen" },
  { id: "R-088", hazard: "Vehicle reversing in yard",        L: 4, S: 3, owner: "R. Patel" },
  { id: "R-104", hazard: "Chemical handling — solvent",      L: 2, S: 3, owner: "F. Noor" },
];
const score = (l:number,s:number)=>l*s;
const scoreColor = (n:number)=> n>=15?"bg-destructive text-destructive-foreground":n>=8?"bg-warning text-warning-foreground":n>=4?"bg-warning/50":"bg-success/40";
const cellTone = (l:number,s:number)=>{const n=l*s;return n>=15?"bg-destructive":n>=10?"bg-destructive/70":n>=6?"bg-warning":n>=3?"bg-warning/40":"bg-success/40";};

function Risk() {
  return (
    <AppShell title="Risk (HIRA)" subtitle="Hazard Identification & Risk Assessment register"
      actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4"/>New Assessment</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Risks" value={142} icon={ShieldAlert} tone="primary"/>
        <KpiCard label="High/Critical" value={18} icon={AlertCircle} tone="destructive"/>
        <KpiCard label="Mitigated YTD" value={56} icon={TrendingDown} tone="success"/>
        <KpiCard label="Pending Review" value={12} icon={ShieldAlert} tone="warning"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Risk Register" className="lg:col-span-2">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-2.5 font-medium">ID</th>
                <th className="py-2.5 font-medium">Hazard</th>
                <th className="py-2.5 font-medium text-center">L</th>
                <th className="py-2.5 font-medium text-center">S</th>
                <th className="py-2.5 font-medium text-center">Score</th>
                <th className="px-5 py-2.5 font-medium">Owner</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {risks.map(r=>{
                  const sc = score(r.L,r.S);
                  return (
                    <tr key={r.id} className="hover:bg-muted/40">
                      <td className="px-5 py-3 font-medium">{r.id}</td>
                      <td className="py-3">{r.hazard}</td>
                      <td className="py-3 text-center text-muted-foreground">{r.L}</td>
                      <td className="py-3 text-center text-muted-foreground">{r.S}</td>
                      <td className="py-3 text-center"><span className={`inline-flex items-center justify-center h-7 w-9 rounded font-semibold text-xs ${scoreColor(sc)}`}>{sc}</span></td>
                      <td className="px-5 py-3 text-muted-foreground">{r.owner}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="5×5 Risk Matrix" description="Likelihood × Severity">
          <div className="space-y-1">
            <div className="flex gap-1 ml-8">{[1,2,3,4,5].map(s=><div key={s} className="flex-1 text-center text-[10px] text-muted-foreground">S{s}</div>)}</div>
            {[5,4,3,2,1].map(l=>(
              <div key={l} className="flex items-center gap-1">
                <div className="w-8 text-[10px] text-muted-foreground text-right pr-1">L{l}</div>
                {[1,2,3,4,5].map(s=>(
                  <div key={s} className={`flex-1 aspect-square rounded ${cellTone(l,s)} text-[10px] font-semibold flex items-center justify-center text-foreground/70`}>{l*s}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-success/40"/>Low</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-warning"/>Medium</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-destructive/70"/>High</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-destructive"/>Critical</div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
