import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Button } from "@/components/ui/button";
import { GraduationCap, Award, AlertTriangle, Users, Plus } from "lucide-react";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Training & Competency — QEHS Live" }] }),
  component: Training,
});

const employees = [
  { name: "Ahmed Al-Saud", role: "Driver" },
  { name: "Mei Tanaka", role: "Operator" },
  { name: "Carlos Mendez", role: "Supervisor" },
  { name: "Priya Singh", role: "Technician" },
  { name: "Liam O'Brien", role: "Driver" },
  { name: "Fatima Noor", role: "Engineer" },
];
const courses = ["H2S", "Heights", "Defensive Driving", "First Aid", "Confined Space", "LOTO"];
// 0=valid, 1=expiring, 2=expired
const matrix = [
  [0,0,2,0,1,0],[0,1,0,0,0,2],[0,0,0,1,0,0],[1,0,0,0,2,0],[0,0,0,0,0,0],[2,0,1,0,0,0],
];
const cellColor = (v:number) => v===0 ? "bg-success/80 text-success-foreground" : v===1 ? "bg-warning/80 text-warning-foreground" : "bg-destructive/80 text-destructive-foreground";
const cellLabel = (v:number) => v===0 ? "✓" : v===1 ? "!" : "✕";

function Training() {
  return (
    <AppShell title="Training & Competency" subtitle="Workforce certification matrix and expiry tracking"
      actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4"/>Assign Training</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Employees" value={1284} icon={Users} tone="primary"/>
        <KpiCard label="Compliant" value="91%" icon={Award} tone="success"/>
        <KpiCard label="Expiring 30d" value={48} icon={AlertTriangle} tone="warning"/>
        <KpiCard label="Expired" value={17} icon={GraduationCap} tone="destructive"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Employee Profile" description="Ahmed Al-Saud — Driver">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-semibold">AS</div>
            <div>
              <div className="font-semibold">Ahmed Al-Saud</div>
              <div className="text-xs text-muted-foreground">EMP-00421 · Logistics</div>
            </div>
          </div>
          <div className="flex gap-1 border-b border-border mb-3 text-xs">
            {["Overview","Certs","History","Documents"].map((t,i)=>(
              <button key={t} className={`px-3 py-2 -mb-px border-b-2 ${i===0?"border-primary text-primary font-medium":"border-transparent text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between"><dt className="text-muted-foreground">Hire Date</dt><dd>2021-03-14</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Site</dt><dd>Jeddah Port</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">License</dt><dd>HGV Class A</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Compliance</dt><dd className="font-semibold text-success">94%</dd></div>
          </dl>
        </Section>

        <Section title="Training Matrix" className="lg:col-span-2"
          action={<div className="flex items-center gap-3 text-xs"><span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-success/80"/>Valid</span><span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-warning/80"/>Expiring</span><span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-destructive/80"/>Expired</span></div>}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr><th className="text-left pb-2 font-medium">Employee</th>{courses.map(c=><th key={c} className="px-2 pb-2 font-medium text-muted-foreground">{c}</th>)}</tr></thead>
              <tbody>
                {employees.map((e,i)=>(
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 pr-2"><div className="font-medium">{e.name}</div><div className="text-[10px] text-muted-foreground">{e.role}</div></td>
                    {matrix[i].map((v,j)=>(
                      <td key={j} className="px-1 py-2"><div className={`h-8 w-full rounded flex items-center justify-center font-semibold ${cellColor(v)}`}>{cellLabel(v)}</div></td>
                    ))}
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
