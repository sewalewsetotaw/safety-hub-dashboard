import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download, History } from "lucide-react";

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [{ title: "Compliance & Documents — QEHS Live" }] }),
  component: Compliance,
});

const legal = [
  { ref:"OSHA 1910.146", title:"Permit-required confined spaces", jurisdiction:"US", status:"valid" as const },
  { ref:"ISO 45001:2018", title:"Occupational H&S Management", jurisdiction:"Global", status:"valid" as const },
  { ref:"EU 2017/745",   title:"Medical Devices Regulation",     jurisdiction:"EU", status:"valid" as const },
  { ref:"SASO 2870",     title:"Industrial Safety Code",          jurisdiction:"KSA", status:"pending" as const },
];
const docs = [
  { name:"HSE Policy 2026", v:"v4.2", owner:"S. Karim", updated:"2026-03-12" },
  { name:"Emergency Response Plan", v:"v3.1", owner:"M. Hassan", updated:"2026-02-28" },
  { name:"PPE Program Manual", v:"v2.0", owner:"L. Chen", updated:"2026-01-15" },
  { name:"Lifting Operations SOP", v:"v1.7", owner:"R. Patel", updated:"2025-11-04" },
];

function Compliance() {
  return (
    <AppShell title="Compliance & Documents" subtitle="Legal register and controlled document library"
      actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4"/>Add Document</Button>}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Legal Register" description="Applicable regulations">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                <th className="px-5 py-2.5 font-medium">Reference</th>
                <th className="py-2.5 font-medium">Title</th>
                <th className="py-2.5 font-medium">Region</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {legal.map(l=>(
                  <tr key={l.ref} className="hover:bg-muted/40">
                    <td className="px-5 py-3 font-mono text-xs">{l.ref}</td>
                    <td className="py-3">{l.title}</td>
                    <td className="py-3 text-muted-foreground">{l.jurisdiction}</td>
                    <td className="px-5 py-3"><StatusBadge status={l.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Document Library" description="Version-controlled SOPs & policies">
          <div className="divide-y divide-border">
            {docs.map(d=>(
              <div key={d.name} className="py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center"><FileText className="h-5 w-5"/></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{d.name} <span className="text-xs text-muted-foreground font-normal ml-1">{d.v}</span></div>
                  <div className="text-xs text-muted-foreground">{d.owner} · Updated {d.updated}</div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8"><History className="h-4 w-4"/></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4"/></Button>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Approval Workflow" description="Document approval pipeline" className="mt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {["Draft","Technical Review","HSE Manager","Executive Sign-off","Published"].map((stage,i)=>(
            <div key={stage} className="flex items-center gap-2 sm:flex-1">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold ${i<3?"bg-success text-success-foreground":i===3?"bg-primary text-primary-foreground ring-4 ring-primary-soft":"bg-muted text-muted-foreground"}`}>{i+1}</div>
              <div className="text-sm font-medium">{stage}</div>
              {i<4 && <div className="hidden sm:block flex-1 h-px bg-border ml-2"/>}
            </div>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
