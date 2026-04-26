import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/qehs/AppShell";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Section } from "@/components/qehs/widgets/Section";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Truck, ShieldAlert, Calendar, Filter, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — QEHS Live" }, { name: "description", content: "Executive QEHS performance overview." }] }),
  component: Dashboard,
});

const trendData = [12,14,9,11,16,13,18,15,12,9,7,10];
const ltiData = [
  { name: "Medical Treatment", value: 8, color: "hsl(var(--warning))" },
  { name: "Restricted Work", value: 5, color: "hsl(var(--info))" },
  { name: "Lost Time", value: 3, color: "hsl(var(--destructive))" },
  { name: "First Aid Only", value: 14, color: "hsl(var(--success))" },
];
const heatmap = [
  ["Operations", 4,3,2,1,2],
  ["Logistics",  3,5,2,1,1],
  ["Maintenance",2,4,5,3,1],
  ["Warehouse",  1,2,3,4,2],
  ["Office",     1,1,2,1,1],
];
const heatColor = (v: number) => {
  if (v >= 5) return "bg-destructive text-destructive-foreground";
  if (v >= 4) return "bg-destructive/70 text-destructive-foreground";
  if (v >= 3) return "bg-warning text-warning-foreground";
  if (v >= 2) return "bg-warning/50 text-warning-foreground";
  return "bg-success/40 text-success-foreground";
};

function Dashboard() {
  const max = Math.max(...trendData);
  return (
    <AppShell
      title="Executive Dashboard"
      subtitle="Real-time QEHS performance across all sites"
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-1.5"><Calendar className="h-4 w-4" /> Last 30 days</Button>
          <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-4 w-4" /> Filters</Button>
          <Button size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard label="LTI" value="3" delta="1" trend="down" icon={ShieldAlert} tone="success" />
        <KpiCard label="LTIFR" value="0.18" delta="0.02" trend="down" icon={ShieldAlert} tone="success" />
        <KpiCard label="CAPA Closure" value="87" suffix="%" delta="3.1%" trend="up" icon={CheckCircle2} tone="primary" />
        <KpiCard label="Active Vehicles" value="248" delta="12" trend="up" icon={Truck} tone="info" />
        <KpiCard label="Open Risks" value="36" delta="4" trend="up" icon={AlertTriangle} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Section title="Incident Trends" description="Recordable incidents — last 12 months" className="lg:col-span-2"
          action={<div className="flex gap-1 text-xs"><span className="px-2 py-1 rounded bg-muted">12M</span><span className="px-2 py-1 rounded text-muted-foreground">6M</span><span className="px-2 py-1 rounded text-muted-foreground">3M</span></div>}>
          <div className="h-56 flex items-end gap-2 pt-4">
            {trendData.map((v,i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60" style={{ height: `${(v/max)*100}%` }} />
                <span className="text-[10px] text-muted-foreground">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="LTI Breakdown" description="Lost Time Injuries by category — YTD">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ltiData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {ltiData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Section title="Risk Heat Map" description="Department × Severity" className="lg:col-span-3">
          <div className="space-y-1.5">
            {heatmap.map((row, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-20 text-[11px] text-muted-foreground truncate">{row[0]}</span>
                {(row.slice(1) as number[]).map((v, j) => (
                  <div key={j} className={`flex-1 h-7 rounded text-[10px] font-semibold flex items-center justify-center ${heatColor(v)}`}>{v}</div>
                ))}
              </div>
            ))}
            <div className="flex items-center gap-1.5 pt-2">
              <span className="w-20" />
              {["L1","L2","L3","L4","L5"].map(l => <span key={l} className="flex-1 text-center text-[10px] text-muted-foreground">{l}</span>)}
            </div>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Overdue CAPA" description="Action items past SLA"
          action={<Button variant="ghost" size="sm">View all</Button>}>
          <div className="divide-y divide-border">
            {[
              { id: "CAPA-2041", title: "Replace damaged lifting sling — Yard B", days: 8, owner: "M. Hassan" },
              { id: "CAPA-2038", title: "Update HIRA for Tank Cleaning Op", days: 5, owner: "S. Karim" },
              { id: "CAPA-2031", title: "Driver fatigue management refresher", days: 3, owner: "L. Chen" },
              { id: "CAPA-2027", title: "Install secondary containment — Bay 4", days: 2, owner: "R. Patel" },
            ].map(c => (
              <div key={c.id} className="py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-destructive-soft text-destructive flex items-center justify-center text-xs font-semibold">{c.days}d</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.id} · {c.owner}</div>
                </div>
                <StatusBadge status="overdue" />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Expiring Certifications" description="Next 60 days"
          action={<Button variant="ghost" size="sm">View all</Button>}>
          <div className="divide-y divide-border">
            {[
              { name: "Ahmed Al-Saud", cert: "H2S Awareness", days: 4, type: "destructive" },
              { name: "Mei Tanaka", cert: "Working at Heights", days: 12, type: "warning" },
              { name: "Carlos Mendez", cert: "Defensive Driving", days: 23, type: "warning" },
              { name: "Priya Singh", cert: "First Aid & CPR", days: 41, type: "info" },
            ].map((e,i) => (
              <div key={i} className="py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                  {e.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.cert}</div>
                </div>
                <span className={`text-xs font-medium ${e.type==="destructive"?"text-destructive":e.type==="warning"?"text-warning-foreground":"text-info"}`}>
                  {e.days}d left
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
