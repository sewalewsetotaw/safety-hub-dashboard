import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { Button } from "@/components/ui/button";
import { BarChart3, FileBarChart, PieChart, LineChart, Download } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — QEHS Live" }] }),
  component: Reports,
});

const reports = [
  { name:"Monthly HSE Performance", desc:"TRIR, LTIFR, near-miss trends", icon: LineChart },
  { name:"Incident Root Cause Analysis", desc:"Pareto by category & site", icon: BarChart3 },
  { name:"Compliance Scorecard", desc:"Vendor & site compliance", icon: PieChart },
  { name:"Training Compliance", desc:"Matrix completion by team", icon: FileBarChart },
  { name:"Waste & Environmental", desc:"Streams, recycled %, manifests", icon: PieChart },
  { name:"Permit Activity", desc:"PTW issued, approval times", icon: BarChart3 },
];
const bars = [62,71,58,74,81,68,77];

function Reports() {
  return (
    <AppShell title="Reports & Analytics" subtitle="Generate and schedule executive reports"
      actions={<Button size="sm" className="gap-1.5"><Download className="h-4 w-4"/>Export All</Button>}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Section title="Performance Index" description="Composite QEHS score · weekly" className="lg:col-span-2">
          <div className="h-56 flex items-end gap-3 pt-4">
            {bars.map((v,i)=>(
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-gradient-to-t from-success to-success/50" style={{height:`${v}%`}}/>
                <span className="text-[10px] text-muted-foreground">W{i+1}</span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Compliance Mix" description="Across all sites">
          <div className="relative w-40 h-40 mx-auto">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-border" strokeWidth="3.5"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-success" strokeWidth="3.5" strokeDasharray="78 100" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-warning" strokeWidth="3.5" strokeDasharray="14 100" strokeDashoffset="-78" strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-semibold">87%</div>
              <div className="text-[10px] text-muted-foreground">compliant</div>
            </div>
          </div>
          <div className="space-y-1.5 mt-3 text-xs">
            <div className="flex justify-between"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success"/>Compliant</span><span className="text-muted-foreground">78%</span></div>
            <div className="flex justify-between"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning"/>At Risk</span><span className="text-muted-foreground">14%</span></div>
            <div className="flex justify-between"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-border"/>Non-Compliant</span><span className="text-muted-foreground">8%</span></div>
          </div>
        </Section>
      </div>

      <Section title="Report Library" description="Standard & scheduled reports">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reports.map(r=>(
            <button key={r.name} className="text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-primary-soft/30 transition-colors group">
              <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <r.icon className="h-5 w-5"/>
              </div>
              <div className="font-medium text-sm">{r.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
            </button>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
