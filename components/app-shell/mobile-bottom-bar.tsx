"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutList, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddExpense } from "./add-expense-context";
import { isActiveRoute } from "./desktop-rail";

export function MobileBottomBar() {
  const pathname = usePathname();
  const { openAddExpense } = useAddExpense();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-[var(--vv-offset-bottom)] z-50 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="mx-auto grid h-[72px] max-w-lg grid-cols-4 items-end px-1">
        <MobileNavLink
          href="/daily-view"
          label="Today"
          icon={CalendarDays}
          active={isActiveRoute(pathname, "/daily-view")}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={openAddExpense}
            aria-label="Add expense"
            className="relative -top-2.5 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(28,24,20,0.12)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Plus className="size-6 stroke-[2.5px]" aria-hidden />
          </button>
        </div>

        <MobileNavLink
          href="/dashboard"
          label="Review"
          icon={LayoutList}
          active={isActiveRoute(pathname, "/dashboard")}
        />
        <MobileNavLink
          href="/reports"
          label="Reports"
          icon={FileText}
          active={isActiveRoute(pathname, "/reports")}
        />
      </div>
    </nav>
  );
}

function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof CalendarDays;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={cn(
        "flex min-h-11 flex-col items-center justify-center gap-0.5 pb-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className={cn("size-5", active && "stroke-[2.5px]")} aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
