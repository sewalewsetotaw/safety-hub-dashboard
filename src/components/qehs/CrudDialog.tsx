import { type ReactNode } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function CrudDialog({
  open, onOpenChange, title, description, onSubmit, busy, children, submitLabel = "Save",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  busy?: boolean;
  children: ReactNode;
  submitLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="grid gap-4 py-4">{children}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-toast-handled="1">
              Cancel
            </Button>
            <Button type="submit" disabled={busy} data-toast-handled="1">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDeleteDialog({
  open, onOpenChange, onConfirm, busy, title = "Delete record?", description,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
  busy?: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description ?? "This action cannot be undone."}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-toast-handled="1">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={busy} data-toast-handled="1">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}