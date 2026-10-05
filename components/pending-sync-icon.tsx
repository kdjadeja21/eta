import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function PendingSyncIcon({ className }: { className?: string }) {
  return (
    <RefreshCw
      role="img"
      aria-label="Syncing"
      className={cn(
        "h-3 w-3 shrink-0 animate-spin text-muted-foreground",
        className,
      )}
    />
  );
}

export function PendingSyncBadge() {
  return (
    <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-background shadow-sm ring-2 ring-background">
      <PendingSyncIcon />
    </span>
  );
}
