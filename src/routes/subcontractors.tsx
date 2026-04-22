import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { KpiCard } from "@/components/qehs/widgets/KpiCard";
import { Button } from "@/components/ui/button";
import { Building2, Upload, FileCheck, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/subcontractors")({
  head: () => ({ meta: [{ title: "Subcontractors — QEHS Live" }] }),
  component: Subs,
});

function Subs() {
  return (
    <AppShell title="Subcontractor Management" subtitle="Vendor onboarding, document control, and compliance scoring">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active Vendors" value={87} icon={Building2} tone="primary"/>
        <KpiCard label="Pending Approval" value={12} icon={Clock} tone="warning"/>
        <KpiCard label="Avg Compliance" value="82%" icon={CheckCircle2} tone="success"/>
        <KpiCard label="Documents Reviewed" value={341} icon={FileCheck} tone="info"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section title="Vendor Profile" description="Apex Industrial Services LLC">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-lg">AI</div>
            <div>
              <div className="font-semibold">Apex Industrial</div>
              <div className="text-xs text-muted-foreground">VND-0042 · Mech. Maintenance</div>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 mb-3">
            <div className="text-xs text-muted-foreground mb-1">Compliance Score</div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-semibold">88</span>
              <span className="text-xs text-muted-foreground mb-1">/ 100</span>
            </div>
            <div className="h-2 rounded-full bg-border overflow-hidden">
              <div className="h-full bg-gradient-to-r from-success to-success/70" style={{width:"88%"}}/>
            </div>
          </div>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between"><dt className="text-muted-foreground">Insurance</dt><dd className="text-success font-medium">Valid</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">ISO 45001</dt><dd className="text-success font-medium">Certified</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Last Audit</dt><dd>2026-02-11</dd></div>
          </dl>
        </Section>

        <Section title="Document Upload" description="Required compliance documents">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-3">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2"/>
            <p className="text-sm font-medium">Drop files or browse</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG up to 25MB</p>
          </div>
          {[
            ["Insurance Certificate","approved"],
            ["HSE Policy","approved"],
            ["Workers Comp","pending"],
            ["Equipment List","approved"],
          ].map(([n,s]:any,i)=>(
            <div key={i} className="flex items-center justify-between py-2 border-t border-border first:border-0">
              <span className="text-sm">{n}</span>
              <StatusBadge status={s}/>
            </div>
          ))}
        </Section>

        <Section title="Approval Workflow" description="Vendor onboarding pipeline">
          <ol className="space-y-3">
            {[
              ["Documents Submitted","done","M. Hassan · 3 days ago"],
              ["HSE Review","done","S. Karim · 2 days ago"],
              ["Risk Assessment","current","Awaiting QEHS Manager"],
              ["Final Approval","pending","Pending"],
              ["Active Vendor","pending","—"],
            ].map(([t,s,note]:any,i)=>(
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${s==="done"?"bg-success text-success-foreground":s==="current"?"bg-primary text-primary-foreground ring-4 ring-primary-soft":"bg-muted text-muted-foreground"}`}>{i+1}</div>
                  {i<4 && <div className={`w-px flex-1 my-1 ${s==="done"?"bg-success":"bg-border"}`}/>}
                </div>
                <div className="pb-3">
                  <div className="text-sm font-medium">{t}</div>
                  <div className="text-xs text-muted-foreground">{note}</div>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </AppShell>
  );
}
