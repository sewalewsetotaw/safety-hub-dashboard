import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({ label, value, delta, trend = "up", icon: Icon, tone = "primary", suffix }: {
  label: string; value: string | number; delta?: string; trend?: "up" | "down";
  icon: LucideIcon; tone?: "primary" | "success" | "warning" | "destructive" | "info"; suffix?: string;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-foreground",
    destructive: "bg-destructive-soft text-destructive",
    info: "bg-info-soft text-info",
  };
  return (
    <div className="qehs-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight text-foreground">{value}</span>
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
          {delta && (
            <p className={cn("mt-1 text-xs font-medium", trend === "up" ? "text-success" : "text-destructive")}>
              {trend === "up" ? "▲" : "▼"} {delta} vs last month
            </p>
          )}
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
