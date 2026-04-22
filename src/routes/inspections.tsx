import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, WifiOff, AlertOctagon, CheckCircle2, X, Smartphone } from "lucide-react";

export const Route = createFileRoute("/inspections")({
  head: () => ({ meta: [{ title: "Site Inspections — QEHS Live" }] }),
  component: Inspections,
});

function Inspections() {
  return (
    <AppShell title="Site Inspections" subtitle="Mobile-first checklists with photo, GPS, and offline capture">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Section title="Mobile Inspection" description="Field worker view" className="lg:col-span-1">
          <div className="mx-auto max-w-[320px] rounded-[2rem] border-8 border-foreground/90 bg-background overflow-hidden shadow-elevated">
            <div className="bg-foreground/90 text-background px-4 py-1.5 text-[10px] flex justify-between"><span>9:41</span><span className="flex items-center gap-1"><WifiOff className="h-3 w-3"/>Offline</span></div>
            <div className="bg-primary text-primary-foreground px-4 py-3"><div className="text-xs opacity-80">Site Inspection</div><div className="font-semibold">Yard B — Daily</div></div>
            <div className="p-4 space-y-2">
              {[["PPE compliance",true],["Housekeeping",true],["Fire extinguishers",false],["Spill kits accessible",true]].map(([l,ok]:any,i)=>(
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
                  <div className={`h-5 w-5 rounded ${ok?"bg-success":"bg-destructive"} flex items-center justify-center`}>
                    {ok?<CheckCircle2 className="h-3 w-3 text-success-foreground"/>:<X className="h-3 w-3 text-destructive-foreground"/>}
                  </div>
                  <span className="text-xs flex-1">{l}</span>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button size="sm" variant="outline" className="text-xs gap-1"><Camera className="h-3 w-3"/>Photo</Button>
                <Button size="sm" variant="outline" className="text-xs gap-1"><MapPin className="h-3 w-3"/>GPS</Button>
              </div>
              <Button className="w-full mt-2 text-xs">Submit</Button>
            </div>
          </div>
        </Section>

        <Section title="STOP WORK Alert" description="Critical hazard escalation" className="lg:col-span-2">
          <div className="rounded-xl bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground p-8 text-center">
            <AlertOctagon className="h-16 w-16 mx-auto mb-4"/>
            <div className="text-3xl font-bold tracking-tight mb-2">STOP WORK</div>
            <div className="text-sm opacity-90 mb-1">Critical hazard identified at Yard B — Bay 4</div>
            <div className="text-xs opacity-75 mb-6">Reported by M. Hassan · 2 minutes ago · 24.7136° N, 46.6753° E</div>
            <div className="bg-background/10 backdrop-blur rounded-lg p-4 text-left mb-6">
              <div className="text-xs opacity-80 mb-1">Hazard</div>
              <div className="font-semibold mb-3">Unsecured load above pedestrian walkway</div>
              <div className="text-xs opacity-80 mb-1">Immediate Action Required</div>
              <div className="text-sm">Evacuate the area within 20m. Notify shift supervisor and crane operator.</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="bg-background/10 backdrop-blur text-destructive-foreground border-destructive-foreground/30 hover:bg-background/20">Escalate</Button>
              <Button className="bg-background text-destructive hover:bg-background/90">Acknowledge</Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="qehs-card p-4 text-center"><Smartphone className="h-5 w-5 mx-auto mb-1 text-primary"/><div className="text-xs text-muted-foreground">Today</div><div className="font-semibold">142</div></div>
            <div className="qehs-card p-4 text-center"><CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-success"/><div className="text-xs text-muted-foreground">Passed</div><div className="font-semibold">128</div></div>
            <div className="qehs-card p-4 text-center"><AlertOctagon className="h-5 w-5 mx-auto mb-1 text-destructive"/><div className="text-xs text-muted-foreground">Stop Work</div><div className="font-semibold">3</div></div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
