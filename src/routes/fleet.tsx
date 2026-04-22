import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Wrench, AlertCircle, CheckCircle2, Camera, MapPin, WifiOff, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/fleet")({
  head: () => ({ meta: [{ title: "Fleet & Equipment — QEHS Live" }] }),
  component: Fleet,
});

const vehicles = [
  { id: "TRK-1042", type: "Tanker", driver: "M. Hassan", site: "Jeddah Port", inspection: "Today 08:14", status: "active" as const },
  { id: "TRK-0987", type: "Flatbed", driver: "L. Chen", site: "Riyadh DC", inspection: "Today 06:42", status: "active" as const },
  { id: "FLT-203", type: "Forklift", driver: "—", site: "Dammam Yard", inspection: "Yesterday", status: "grounded" as const },
  { id: "TRK-1108", type: "Tanker", driver: "S. Karim", site: "Jubail", inspection: "Today 07:30", status: "active" as const },
  { id: "CRN-04", type: "Mobile Crane", driver: "R. Patel", site: "Yanbu", inspection: "2 days ago", status: "grounded" as const },
];

function Fleet() {
  return (
    <AppShell title="Fleet & Equipment" subtitle="Track inspections, status, and compliance for every asset"
      actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4"/>Add Vehicle</Button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active" value={228} icon={CheckCircle2} tone="success"/>
        <KpiCard label="Grounded" value={12} icon={AlertCircle} tone="destructive"/>
        <KpiCard label="In Maintenance" value={8} icon={Wrench} tone="warning"/>
        <KpiCard label="Total Fleet" value={248} icon={Truck} tone="primary"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Vehicle Register" className="lg:col-span-2"
          action={<div className="relative w-56"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input className="pl-9 h-9" placeholder="Search vehicles…"/></div>}>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Asset ID</th>
                  <th className="py-2.5 font-medium">Type</th>
                  <th className="py-2.5 font-medium">Driver</th>
                  <th className="py-2.5 font-medium">Site</th>
                  <th className="py-2.5 font-medium">Last Inspection</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{v.id}</td>
                    <td className="py-3 text-muted-foreground">{v.type}</td>
                    <td className="py-3">{v.driver}</td>
                    <td className="py-3 text-muted-foreground">{v.site}</td>
                    <td className="py-3 text-muted-foreground">{v.inspection}</td>
                    <td className="px-5 py-3"><StatusBadge status={v.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Daily Inspection" description="Mobile-first form preview">
          <div className="rounded-xl border border-border bg-gradient-to-br from-muted/40 to-background p-4">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-medium">TRK-1042 · Pre-trip</span>
              <span className="flex items-center gap-1 text-success"><span className="h-1.5 w-1.5 rounded-full bg-success"/>Online</span>
            </div>
            {[
              ["Tires & wheels", true],
              ["Lights & signals", true],
              ["Brakes test", true],
              ["Fluid leaks", false],
              ["PPE on board", true],
            ].map(([label, ok], i) => (
              <label key={i} className="flex items-center gap-3 py-2 border-t border-border first:border-0">
                <span className={`h-5 w-5 rounded-md border-2 flex items-center justify-center ${ok ? "bg-success border-success" : "border-border"}`}>
                  {ok ? <CheckCircle2 className="h-3 w-3 text-success-foreground"/> : null}
                </span>
                <span className="text-sm flex-1">{label as string}</span>
              </label>
            ))}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button variant="outline" size="sm" className="gap-1.5"><Camera className="h-4 w-4"/>Photo</Button>
              <Button variant="outline" size="sm" className="gap-1.5"><MapPin className="h-4 w-4"/>GPS</Button>
            </div>
            <Button size="sm" className="w-full mt-2">Submit Inspection</Button>
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1"><WifiOff className="h-3 w-3"/>Offline-ready · syncs automatically</p>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
