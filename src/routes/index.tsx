import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/qehs/AppShell";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Section } from "@/components/qehs/widgets/Section";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Truck, ShieldAlert, Calendar, Filter, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — QEHS Live" }, { name: "description", content: "Executive QEHS performance overview." }] }),
  component: Dashboard,
});

const heatColor = (v: number) => {
  if (v >= 5) return "bg-destructive text-destructive-foreground";
  if (v >= 4) return "bg-destructive/70 text-destructive-foreground";
  if (v >= 3) return "bg-warning text-warning-foreground";
  if (v >= 2) return "bg-warning/50 text-warning-foreground";
  return "bg-success/40 text-success-foreground";
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

  // KPI calculations
  const ltiCount = incidents.filter(x => x.incident_type === "lost-time" || x.severity === "high" || x.severity === "critical").length;
  const activeVehicles = vehicles.filter(v => v.status === "active").length;
  const openRisks = risks.filter(r => r.status !== "closed" && r.status !== "mitigated").length;
  const closedAudits = audits.filter(a => a.status === "closed" || a.status === "completed").length;
  const capaClosure = audits.length > 0 ? Math.round((closedAudits / audits.length) * 100) : 0;

  // Days since last LTI
  const daysSinceLTI = useMemo(() => {
    const ltis = incidents
      .filter(x => x.incident_type === "lost-time" || x.severity === "high" || x.severity === "critical")
      .map(x => new Date(x.occurred_at).getTime())
      .filter(t => !isNaN(t));
    if (ltis.length === 0) return null;
    const last = Math.max(...ltis);
    return Math.max(0, Math.floor((Date.now() - last) / 86400000));
  }, [incidents]);

  // Incident trend by month (last 12)
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

  // LTI breakdown by incident_type
  const ltiData = useMemo(() => {
    const counts: Record<string, number> = { "Medical Treatment": 0, "Restricted Work": 0, "Lost Time": 0, "First Aid Only": 0 };
    incidents.forEach(inc => {
      const t = inc.incident_type;
      if (t === "lost-time") counts["Lost Time"]++;
      else if (t === "medical") counts["Medical Treatment"]++;
      else if (t === "restricted") counts["Restricted Work"]++;
      else counts["First Aid Only"]++;
    });
    return [
      { name: "Medical Treatment", value: counts["Medical Treatment"], color: "hsl(var(--warning))" },
      { name: "Restricted Work", value: counts["Restricted Work"], color: "hsl(var(--info))" },
      { name: "Lost Time", value: counts["Lost Time"], color: "hsl(var(--destructive))" },
      { name: "First Aid Only", value: counts["First Aid Only"], color: "hsl(var(--success))" },
    ].filter(d => d.value > 0);
  }, [incidents]);

  // Heatmap: category × likelihood (L1..L5)
  const heatmap = useMemo(() => {
    const cats = Array.from(new Set(risks.map(r => r.category))).slice(0, 5);
    if (cats.length === 0) return [] as (string | number)[][];
    return cats.map(cat => {
      const row: (string | number)[] = [cat.charAt(0).toUpperCase() + cat.slice(1)];
      for (let l = 1; l <= 5; l++) {
        row.push(risks.filter(r => r.category === cat && r.likelihood === l).length);
      }
      return row;
    });
  }, [risks]);

  // Overdue inspections (acting as CAPA)
  const overdueCapa = useMemo(() => {
    const today = new Date();
    return inspections
      .filter(i => i.due_date && new Date(i.due_date) < today && i.status !== "closed" && i.status !== "completed")
      .slice(0, 4)
      .map(i => {
        const days = Math.floor((today.getTime() - new Date(i.due_date!).getTime()) / 86400000);
        return { id: i.id.slice(0, 8).toUpperCase(), title: i.title, days, owner: "—" };
      });
  }, [inspections]);

  // Expiring certifications
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
      subtitle="Real-time QEHS performance across all sites"
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate({ to: "/reports" })}>
            <Calendar className="h-4 w-4" /> Last 30 days
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate({ to: "/reports" })}>
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleExport} data-toast-handled="1">
            <Download className="h-4 w-4" /> Export
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard label="LTI Count" value={ltiCount} icon={ShieldAlert} tone={ltiCount === 0 ? "success" : "destructive"} />
        <KpiCard label="Days Since Last LTI" value={daysSinceLTI ?? "—"} suffix={daysSinceLTI !== null ? "days" : undefined} icon={ShieldAlert} tone={daysSinceLTI === null || daysSinceLTI > 30 ? "success" : daysSinceLTI > 7 ? "warning" : "destructive"} />
        <KpiCard label="CAPA Closure" value={capaClosure} suffix="%" icon={CheckCircle2} tone="primary" />
        <KpiCard label="Active Vehicles" value={activeVehicles} icon={Truck} tone="info" />
        <KpiCard label="Open Risks" value={openRisks} icon={AlertTriangle} tone="warning" />
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
            {ltiData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No incident data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ltiData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {ltiData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Section title="Risk Heat Map" description="Department × Severity" className="lg:col-span-3">
          <div className="space-y-1.5">
            {heatmap.length === 0 && <div className="text-xs text-muted-foreground py-4">No risks recorded yet.</div>}
            {heatmap.map((row, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-20 text-[11px] text-muted-foreground truncate">{row[0]}</span>
                {(row.slice(1) as number[]).map((v, j) => (
                  <div key={j} className={`flex-1 h-7 rounded text-[10px] font-semibold flex items-center justify-center ${heatColor(v)}`}>{v}</div>
                ))}
              </div>
            ))}
            {heatmap.length > 0 && <div className="flex items-center gap-1.5 pt-2">
              <span className="w-20" />
              {["L1","L2","L3","L4","L5"].map(l => <span key={l} className="flex-1 text-center text-[10px] text-muted-foreground">{l}</span>)}
            </div>}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Overdue CAPA" description="Action items past SLA"
          action={<Button variant="ghost" size="sm" onClick={() => navigate({ to: "/incidents" })}>View all</Button>}>
          <div className="divide-y divide-border">
            {overdueCapa.length === 0 && <div className="text-xs text-muted-foreground py-4">No overdue items.</div>}
            {overdueCapa.map(c => (
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
          action={<Button variant="ghost" size="sm" onClick={() => navigate({ to: "/training" })}>View all</Button>}>
          <div className="divide-y divide-border">
            {expiring.length === 0 && <div className="text-xs text-muted-foreground py-4">No certifications expiring soon.</div>}
            {expiring.map((e,i) => (
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
