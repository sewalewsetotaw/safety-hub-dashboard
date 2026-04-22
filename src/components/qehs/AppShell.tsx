import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Truck, GraduationCap, Building2, ClipboardCheck,
  AlertTriangle, ShieldAlert, FileSearch, FileText, Leaf,
  FileSignature, Route as RouteIcon, BarChart3, Settings,
  Bell, Search, Globe, ChevronLeft, ChevronRight, Menu, Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/fleet", label: "Fleet & Equipment", icon: Truck },
  { to: "/training", label: "Training & Competency", icon: GraduationCap },
  { to: "/subcontractors", label: "Subcontractors", icon: Building2 },
  { to: "/inspections", label: "Site Inspections", icon: ClipboardCheck },
  { to: "/incidents", label: "Incident & CAPA", icon: AlertTriangle },
  { to: "/risk", label: "Risk (HIRA)", icon: ShieldAlert },
  { to: "/audits", label: "Audit Management", icon: FileSearch },
  { to: "/compliance", label: "Compliance & Docs", icon: FileText },
  { to: "/environmental", label: "Environmental & Waste", icon: Leaf },
  { to: "/ptw", label: "Permit to Work", icon: FileSignature },
  { to: "/journey", label: "Journey Management", icon: RouteIcon },
  { to: "/reports", label: "Reports & Analytics", icon: BarChart3 },
  { to: "/admin", label: "Admin Settings", icon: Settings },
] as const;

export function AppShell({ children, title, subtitle, actions }: {
  children: ReactNode; title: string; subtitle?: string; actions?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const location = useLocation();

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300 z-40",
          "fixed inset-y-0 left-0 lg:static",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm tracking-tight">QEHS Live</div>
              <div className="text-[11px] text-sidebar-foreground/60">Safety Operations</div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map((item) => {
            const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search incidents, permits, vehicles…" className="pl-9 h-9 bg-muted/50 border-transparent" />
            </div>
          </div>
          <div className="flex-1 md:hidden" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-1.5 h-9">
              <Globe className="h-4 w-4" /> <span className="hidden sm:inline text-xs">EN</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleDark}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <div className="ml-2 flex items-center gap-2 pl-3 border-l border-border">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-semibold">
                AR
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-medium">Adam Reed</div>
                <div className="text-[11px] text-muted-foreground">QEHS Manager</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page header */}
        <div className="px-4 lg:px-8 pt-6 pb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        <main className="flex-1 px-4 lg:px-8 pb-10">{children}</main>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: "active" | "grounded" | "open" | "in-progress" | "closed" | "overdue" | "pending" | "approved" | "rejected" | "expired" | "valid" }) {
  const map: Record<string, string> = {
    active: "bg-success-soft text-success border-success/20",
    valid: "bg-success-soft text-success border-success/20",
    closed: "bg-success-soft text-success border-success/20",
    approved: "bg-success-soft text-success border-success/20",
    grounded: "bg-destructive-soft text-destructive border-destructive/20",
    overdue: "bg-destructive-soft text-destructive border-destructive/20",
    rejected: "bg-destructive-soft text-destructive border-destructive/20",
    expired: "bg-destructive-soft text-destructive border-destructive/20",
    open: "bg-warning-soft text-warning-foreground border-warning/30",
    pending: "bg-warning-soft text-warning-foreground border-warning/30",
    "in-progress": "bg-info-soft text-info border-info/20",
  };
  return (
    <Badge variant="outline" className={cn("font-medium capitalize", map[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", {
        "bg-success": ["active","valid","closed","approved"].includes(status),
        "bg-destructive": ["grounded","overdue","rejected","expired"].includes(status),
        "bg-warning": ["open","pending"].includes(status),
        "bg-info": status === "in-progress",
      })} />
      {status.replace("-", " ")}
    </Badge>
  );
}
