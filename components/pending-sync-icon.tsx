import { RefreshCw } from "lucide-react";

export function PendingSyncIcon() {
  return (
    <RefreshCw
      role="img"
      aria-label="Syncing"
      className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground"
    />
  );
}
