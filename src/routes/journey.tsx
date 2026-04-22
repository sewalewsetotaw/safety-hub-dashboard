import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Route as RouteIcon, MapPin, Phone, AlertOctagon, Plus } from "lucide-react";

export const Route = createFileRoute("/journey")({
  head: () => ({ meta: [{ title: "Journey Management — QEHS Live" }] }),
  component: Journey,
});

const trips = [
  { id:"TRP-3041", driver:"M. Hassan", from:"Jeddah", to:"Riyadh", eta:"4h 12m", status:"in-progress" as const },
  { id:"TRP-3040", driver:"L. Chen", from:"Dammam", to:"Jubail", eta:"On site", status:"closed" as const },
  { id:"TRP-3039", driver:"S. Karim", from:"Yanbu", to:"Madinah", eta:"Pending", status:"pending" as const },
];

function Journey() {
  return (
    <AppShell title="Journey Management" subtitle="Trip planning, route tracking, and driver safety"
      actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4"/>Register Trip</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active Trips" value={42} icon={RouteIcon} tone="primary"/>
        <KpiCard label="On Schedule" value="94%" icon={MapPin} tone="success"/>
        <KpiCard label="Delayed" value={3} icon={Phone} tone="warning"/>
        <KpiCard label="SOS Alerts" value={0} icon={AlertOctagon} tone="success"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Trip Registration">
          <form className="space-y-3">
            <div><label className="text-xs font-medium text-muted-foreground">Driver</label><Input className="mt-1 h-9" defaultValue="M. Hassan"/></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium text-muted-foreground">Origin</label><Input className="mt-1 h-9" defaultValue="Jeddah Port"/></div>
              <div><label className="text-xs font-medium text-muted-foreground">Destination</label><Input className="mt-1 h-9" defaultValue="Riyadh DC"/></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium text-muted-foreground">Vehicle</label><Input className="mt-1 h-9" defaultValue="TRK-1042"/></div>
              <div><label className="text-xs font-medium text-muted-foreground">Distance</label><Input className="mt-1 h-9" defaultValue="950 km"/></div>
            </div>
            <Button className="w-full">Start Journey</Button>
          </form>
        </Section>

        <Section title="Live Route" description="TRP-3041 — Hassan, M." className="lg:col-span-2">
          <div className="relative h-64 rounded-lg overflow-hidden bg-gradient-to-br from-info-soft via-success-soft to-primary-soft">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path d="M 30 160 Q 120 40 200 120 T 370 50" stroke="currentColor" className="text-primary" strokeWidth="3" fill="none" strokeDasharray="6 6"/>
              <path d="M 30 160 Q 90 80 160 110" stroke="currentColor" className="text-primary" strokeWidth="3" fill="none"/>
            </svg>
            <div className="absolute left-[7%] top-[78%] flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-success ring-4 ring-success/20"/><span className="text-xs font-medium bg-card px-2 py-0.5 rounded shadow-card">Jeddah</span></div>
            <div className="absolute left-[40%] top-[55%] flex items-center gap-1.5"><span className="h-4 w-4 rounded-full bg-primary ring-4 ring-primary/30 animate-pulse"/><span className="text-xs font-semibold bg-card px-2 py-0.5 rounded shadow-card">TRK-1042</span></div>
            <div className="absolute right-[7%] top-[22%] flex items-center gap-1.5"><span className="text-xs font-medium bg-card px-2 py-0.5 rounded shadow-card">Riyadh</span><span className="h-3 w-3 rounded-full bg-destructive"/></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3 text-center">
            <div className="rounded-lg bg-muted/40 p-2"><div className="text-xs text-muted-foreground">Speed</div><div className="font-semibold">82 km/h</div></div>
            <div className="rounded-lg bg-muted/40 p-2"><div className="text-xs text-muted-foreground">ETA</div><div className="font-semibold">4h 12m</div></div>
            <div className="rounded-lg bg-muted/40 p-2"><div className="text-xs text-muted-foreground">Next Check-in</div><div className="font-semibold">42 min</div></div>
          </div>
          <Button variant="destructive" className="w-full mt-3 gap-2"><AlertOctagon className="h-4 w-4"/>Emergency SOS</Button>
        </Section>
      </div>

      <Section title="Recent Trips" className="mt-4">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="px-5 py-2.5 font-medium">Trip ID</th><th className="py-2.5 font-medium">Driver</th>
              <th className="py-2.5 font-medium">From → To</th><th className="py-2.5 font-medium">ETA</th><th className="px-5 py-2.5 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {trips.map(t=>(
                <tr key={t.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{t.id}</td>
                  <td className="py-3">{t.driver}</td>
                  <td className="py-3 text-muted-foreground">{t.from} → {t.to}</td>
                  <td className="py-3">{t.eta}</td>
                  <td className="px-5 py-3"><StatusBadge status={t.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
}
