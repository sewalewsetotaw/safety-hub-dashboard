import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Leaf, Recycle, Droplets, Trash2 } from "lucide-react";

export const Route = createFileRoute("/environmental")({
  head: () => ({ meta: [{ title: "Environmental & Waste — QEHS Live" }] }),
  component: Env,
});

const waste = [
  { stream:"Hazardous", color:"destructive", kg: 1240, pct: 18 },
  { stream:"Recyclable", color:"success", kg: 4280, pct: 62 },
  { stream:"General", color:"info", kg: 980, pct: 14 },
  { stream:"Organic", color:"warning", kg: 410, pct: 6 },
];
const records = [
  { date:"2026-04-18", stream:"Hazardous", qty:"320 kg", carrier:"GreenWaste Co.", manifest:"MAN-9821" },
  { date:"2026-04-17", stream:"Recyclable", qty:"1.2 t", carrier:"EcoLogix",       manifest:"MAN-9820" },
  { date:"2026-04-15", stream:"General",    qty:"640 kg", carrier:"City Disposal", manifest:"MAN-9818" },
  { date:"2026-04-12", stream:"Hazardous", qty:"180 kg", carrier:"GreenWaste Co.", manifest:"MAN-9815" },
];

function Env() {
  return (
    <AppShell title="Environmental & Waste" subtitle="Track waste streams, disposal, and environmental impact">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Waste (MTD)" value="6.9" suffix="t" icon={Trash2} tone="primary"/>
        <KpiCard label="Recycled" value="62%" icon={Recycle} tone="success"/>
        <KpiCard label="Water Use" value="184" suffix="m³" icon={Droplets} tone="info"/>
        <KpiCard label="CO₂ Avoided" value="2.4" suffix="t" icon={Leaf} tone="success"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Waste Streams" description="Month-to-date">
          <div className="space-y-4">
            {waste.map(w=>(
              <div key={w.stream}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium">{w.stream}</span><span className="text-muted-foreground">{w.kg.toLocaleString()} kg</span></div>
                <div className="h-2 rounded-full bg-border overflow-hidden"><div className={`h-full bg-${w.color}`} style={{width:`${w.pct}%`}}/></div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Disposal Records" className="lg:col-span-2">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="py-2.5 font-medium">Stream</th>
                <th className="py-2.5 font-medium">Qty</th>
                <th className="py-2.5 font-medium">Carrier</th>
                <th className="px-5 py-2.5 font-medium">Manifest</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {records.map(r=>(
                  <tr key={r.manifest} className="hover:bg-muted/40">
                    <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
                    <td className="py-3">{r.stream}</td>
                    <td className="py-3 font-medium">{r.qty}</td>
                    <td className="py-3 text-muted-foreground">{r.carrier}</td>
                    <td className="px-5 py-3 font-mono text-xs">{r.manifest}</td>
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
