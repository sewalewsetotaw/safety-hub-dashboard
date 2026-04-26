import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/qehs/AppShell";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Section } from "@/components/qehs/widgets/Section";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  ShieldAlert, 
  Calendar, 
  Filter, 
  Download, 
  CalendarClock, 
  Activity,
  ArrowRight
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({ 
    meta: [
      { title: "Dashboard — QEHS Live" }, 
      { name: "description", content: "Executive QEHS performance overview." }
    ] 
  }),
  component: Dashboard,
});

// Refined Heatmap Colors
const heatColor = (v: number) => {
  if (v === 0) return "bg-muted/20 text-muted-foreground/40";
  if (v >= 5) return "bg-destructive text-destructive-foreground font-bold shadow-sm";
  if (v >= 3) return "bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/20";
  if (v >= 1) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20";
  return "bg-success/20 text-success-foreground";
};

type Incident = { id: string; title: string; severity: string; incident_type: string; status: string; occurred_at: string; location: string | null };
type Vehicle = { id: string; status: string };
type Risk = { id: string; category: string; likelihood: number; impact: number; score: number | null; status: string };
type Audit = { id: string; status: string; findings_count: number | null };
type Training = { id: string; employee_name: string; course: string; expires_at: string | null; status: string };
type Inspection = { id: string; title: string; status: string; due_date: string | null };

function Dashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [training, setTraining] = useState<Training[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    (async () => {
      const [i, v, r, a, t, ins] = await Promise.all([
        supabase.from("incidents").select("id,title,severity,incident_type,status,occurred_at,location"),
        supabase.from("vehicles").select("id,status"),
        supabase.from("risk_register").select("id,category,likelihood,impact,score,status"),
        supabase.from("audits").select("id,status,findings_count"),
        supabase.from("training_records").select("id,employee_name,course,expires_at,status"),
        supabase.from("inspections").select("id,title,status,due_date"),
      ]);
      setIncidents((i.data ?? []) as Incident[]);
      setVehicles((v.data ?? []) as Vehicle[]);
      setRisks((r.data ?? []) as Risk[]);
      setAudits((a.data ?? []) as Audit[]);
      setTraining((t.data ?? []) as Training[]);
      setInspections((ins.data ?? []) as Inspection[]);
    })();
  }, []);

  // Logic Calculations
  const ltiCount = incidents.filter(x => x.incident_type === "lost-time" || x.severity === "high" || x.severity === "critical").length;
  const activeVehicles = vehicles.filter(v => v.status === "active").length;
  const openRisks = risks.filter(r => r.status !== "closed" && r.status !== "mitigated").length;
  const closedAudits = audits.filter(a => a.status === "closed" || a.status === "completed").length;
  const capaClosure = audits.length > 0 ? Math.round((closedAudits / audits.length) * 100) : 0;
  const assumedHours = Math.max(1, (activeVehicles || 1) * 5 * 2000);
  const ltir = ((ltiCount * 200000) / assumedHours).toFixed(2);

  const daysSinceIncident = useMemo(() => {
    const ts = incidents.map(x => new Date(x.occurred_at).getTime()).filter(t => !isNaN(t));
    if (ts.length === 0) return null;
    return Math.max(0, Math.floor((Date.now() - Math.max(...ts)) / 86400000));
  }, [incidents]);

  const handleExport = () => {
    const rows = [
      ["Metric", "Value"],
      ["LTI Count", String(ltiCount)],
      ["Days Since Incident", daysSinceIncident === null ? "N/A" : String(daysSinceIncident)],
      ["LTIR (per 200k hrs)", String(ltir)],
      ["CAPA Closure %", String(capaClosure)],
      ["Active Vehicles", String(activeVehicles)],
      ["Open Risks", String(openRisks)],
    ];
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qehs-dashboard-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const trendData = useMemo(() => {
    const now = new Date();
    const buckets = Array(12).fill(0);
    incidents.forEach(inc => {
      const d = new Date(inc.occurred_at);
      const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (months >= 0 && months < 12) buckets[11 - months]++;
    });
    return buckets;
  }, [incidents]);
  const max = Math.max(...trendData, 1);

  // New List-based LTI breakdown
  const ltiStats = useMemo(() => {
    const counts = { medical: 0, restricted: 0, lost: 0, firstaid: 0 };
    incidents.forEach(inc => {
      if (inc.incident_type === "lost-time") counts.lost++;
      else if (inc.incident_type === "medical") counts.medical++;
      else if (inc.incident_type === "restricted") counts.restricted++;
      else counts.firstaid++;
    });
    return [
      { label: "Lost Time", value: counts.lost, color: "text-destructive" },
      { label: "Medical Treatment", value: counts.medical, color: "text-orange-500" },
      { label: "Restricted Work", value: counts.restricted, color: "text-blue-500" },
      { label: "First Aid Only", value: counts.firstaid, color: "text-success" },
    ];
  }, [incidents]);

  const heatmap = useMemo(() => {
    const cats = Array.from(new Set(risks.map(r => r.category))).slice(0, 5);
    return cats.map(cat => {
      const row: (string | number)[] = [cat.charAt(0).toUpperCase() + cat.slice(1)];
      for (let l = 1; l <= 5; l++) {
        row.push(risks.filter(r => r.category === cat && r.likelihood === l).length);
      }
      return row;
    });
  }, [risks]);

  const overdueCapa = useMemo(() => {
    const today = new Date();
    return inspections
      .filter(i => i.due_date && new Date(i.due_date) < today && i.status !== "closed" && i.status !== "completed")
      .slice(0, 4)
      .map(i => ({
        id: i.id.slice(0, 8).toUpperCase(),
        title: i.title,
        days: Math.floor((today.getTime() - new Date(i.due_date!).getTime()) / 86400000),
        owner: "Admin"
      }));
  }, [inspections]);

  const expiring = useMemo(() => {
    const today = new Date();
    return training
      .filter(t => t.expires_at)
      .map(t => ({ ...t, days: Math.floor((new Date(t.expires_at!).getTime() - today.getTime()) / 86400000) }))
      .filter(t => t.days >= 0 && t.days <= 60)
      .sort((a, b) => a.days - b.days)
      .slice(0, 4)
      .map(t => ({
        name: t.employee_name,
        cert: t.course,
        days: t.days,
        type: t.days <= 7 ? "destructive" : t.days <= 30 ? "warning" : "info",
      }));
  }, [training]);

  return (
    <AppShell
      title="Executive Dashboard"
      subtitle="Real-time QEHS performance summary"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/reports" })}>
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      }
    >
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          label="Safety Clock"
          value={daysSinceIncident ?? "—"}
          suffix="Days LTI Free"
          icon={CalendarClock}
          tone={daysSinceIncident === null || daysSinceIncident > 30 ? "success" : "destructive"}
        />
        <KpiCard label="LTIR" value={ltir} suffix="Rate" icon={ShieldAlert} tone={Number(ltir) === 0 ? "success" : "destructive"} />
        <KpiCard label="CAPA Closure" value={capaClosure} suffix="%" icon={CheckCircle2} tone="primary" />
        <KpiCard label="Fleet Size" value={activeVehicles} icon={Truck} tone="info" />
        <KpiCard label="Open Risks" value={openRisks} icon={AlertTriangle} tone="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Incident Trends */}
        <Section 
          title="Incident Trends" 
          description="Total recordables (Last 12 Months)" 
          className="lg:col-span-2"
          action={<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rolling View</span>}
        >
          <div className="h-64 flex items-end gap-2 pt-10 px-2">
            {trendData.map((v, i) => (
              <div key={i} className="flex-1 group relative flex flex-col items-center">
                <div 
                  className="absolute -top-8 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                >
                  {v} incidents
                </div>
                <div 
                  className="w-full rounded-t-sm bg-primary/20 group-hover:bg-primary transition-all relative" 
                  style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? '4px' : '0' }}
                />
                <span className="mt-3 text-[10px] text-muted-foreground font-medium uppercase">
                  {["J","F","M","A","M","J","J","A","S","O","N","D"][i]}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* LTI Summary (Replaces Pie Chart) */}
        <Section title="LTI Breakdown" description="Category distribution YTD">
          <div className="space-y-4 pt-4">
            {ltiStats.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${stat.color.replace('text', 'bg')}`} />
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
            {ltiCount === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No incidents recorded.</div>}
          </div>
        </Section>
      </div>

      {/* Heatmap Section */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <Section title="Risk Heat Map" description="Probability (L) vs Severity by Category" className="w-full">
          <div className="pt-4 overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex mb-3">
                <div className="w-32" />
                <div className="flex-1 grid grid-cols-5 gap-2">
                  {["L1 - Insignificant", "L2 - Minor", "L3 - Moderate", "L4 - Major", "L5 - Critical"].map((l) => (
                    <span key={l} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                      {l.split(' - ')[0]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {heatmap.map((row, i) => (
                  <div key={i} className="flex items-center">
                    <span className="w-32 text-xs font-semibold text-muted-foreground pr-4 truncate uppercase tracking-tight">
                      {row[0]}
                    </span>
                    <div className="flex-1 grid grid-cols-5 gap-2">
                      {(row.slice(1) as number[]).map((v, j) => (
                        <div key={j} className={`h-12 rounded flex items-center justify-center text-sm transition-all border ${heatColor(v)}`}>
                          {v > 0 ? v : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue CAPA */}
        <Section 
          title="Overdue CAPA" 
          description="Urgent actions requiring attention"
          action={<Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate({ to: "/incidents" })}>View All <ArrowRight className="ml-1 h-3 w-3" /></Button>}
        >
          <div className="divide-y divide-border pt-2">
            {overdueCapa.length === 0 && <div className="text-sm text-muted-foreground py-8 text-center">Zero overdue items.</div>}
            {overdueCapa.map(c => (
              <div key={c.id} className="py-4 flex items-center gap-4 group">
                <div className="h-10 w-10 shrink-0 rounded bg-destructive/10 text-destructive flex flex-col items-center justify-center border border-destructive/20">
                  <span className="text-xs font-bold leading-none">{c.days}</span>
                  <span className="text-[8px] uppercase font-bold">Days</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{c.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{c.id} • {c.owner}</div>
                </div>
                <StatusBadge status="overdue" />
              </div>
            ))}
          </div>
        </Section>

        {/* Expiring Certifications */}
        <Section 
          title="Expiring Certs" 
          description="Renewals required in < 60 days"
          action={<Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate({ to: "/training" })}>View All <ArrowRight className="ml-1 h-3 w-3" /></Button>}
        >
          <div className="divide-y divide-border pt-2">
            {expiring.length === 0 && <div className="text-sm text-muted-foreground py-8 text-center">All certifications current.</div>}
            {expiring.map((e, i) => (
              <div key={i} className="py-4 flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-bold border">
                  {e.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.cert}</div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded border ${
                  e.type === "destructive" ? "bg-destructive/10 text-destructive border-destructive/20" : 
                  e.type === "warning" ? "bg-warning/10 text-warning-foreground border-warning/20" : 
                  "bg-info/10 text-info border-info/20"
                }`}>
                  {e.days}d left
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}