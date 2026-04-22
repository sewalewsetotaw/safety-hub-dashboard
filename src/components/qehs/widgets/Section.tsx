import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({ title, description, action, children, className }: {
  title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={cn("qehs-card", className)}>
      <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
      </header>
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}
