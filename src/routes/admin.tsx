import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/qehs/AppShell";
import { Section } from "@/components/qehs/widgets/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Users, Shield, Bell, Building, Globe, Key } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Settings — QEHS Live" }] }),
  component: Admin,
});

const roles = [
  { name:"Administrator", users: 4, perms: "Full access" },
  { name:"QEHS Manager", users: 12, perms: "All modules · approve" },
  { name:"Supervisor", users: 38, perms: "Inspect · report · approve site" },
  { name:"Field User", users: 412, perms: "Inspections · incidents · trips" },
  { name:"Vendor", users: 87, perms: "Subcontractor portal only" },
];

function Admin() {
  return (
    <AppShell title="Admin Settings" subtitle="Manage roles, sites, integrations, and preferences">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <nav className="qehs-card p-2 self-start">
          {[
            ["Users & Roles", Users, true],
            ["Permissions", Shield, false],
            ["Sites & Departments", Building, false],
            ["Notifications", Bell, false],
            ["Localization", Globe, false],
            ["API & Integrations", Key, false],
          ].map(([label,Icon,active]:any,i)=>(
            <button key={i} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left ${active?"bg-primary-soft text-primary font-medium":"hover:bg-muted"}`}>
              <Icon className="h-4 w-4"/>{label}
            </button>
          ))}
        </nav>

        <div className="lg:col-span-2 space-y-4">
          <Section title="Roles & Permissions" description="Define what each user type can access">
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="px-5 py-2.5 font-medium">Role</th>
                  <th className="py-2.5 font-medium">Users</th>
                  <th className="py-2.5 font-medium">Permissions</th>
                  <th className="px-5 py-2.5"></th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {roles.map(r=>(
                    <tr key={r.name} className="hover:bg-muted/40">
                      <td className="px-5 py-3 font-medium">{r.name}</td>
                      <td className="py-3 text-muted-foreground">{r.users}</td>
                      <td className="py-3 text-muted-foreground text-xs">{r.perms}</td>
                      <td className="px-5 py-3 text-right"><Button variant="ghost" size="sm">Edit</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Notification Preferences">
            <div className="space-y-3">
              {[
                ["Critical incidents (SMS + Email + Push)", true],
                ["Overdue CAPA daily digest", true],
                ["Permit approvals required", true],
                ["Weekly executive report", false],
                ["Vendor document submissions", true],
              ].map(([label,on]:any,i)=>(
                <div key={i} className="flex items-center justify-between py-2 border-t border-border first:border-0">
                  <span className="text-sm">{label}</span>
                  <Switch defaultChecked={on}/>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Organization">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground">Company</label><Input className="mt-1 h-9" defaultValue="Northwind Industrial Group"/></div>
              <div><label className="text-xs font-medium text-muted-foreground">Time Zone</label><Input className="mt-1 h-9" defaultValue="Asia/Riyadh (GMT+3)"/></div>
              <div><label className="text-xs font-medium text-muted-foreground">Default Language</label><Input className="mt-1 h-9" defaultValue="English"/></div>
              <div><label className="text-xs font-medium text-muted-foreground">Reporting Currency</label><Input className="mt-1 h-9" defaultValue="USD"/></div>
            </div>
            <div className="flex justify-end gap-2 mt-4"><Button variant="outline" size="sm">Cancel</Button><Button size="sm">Save Changes</Button></div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}
