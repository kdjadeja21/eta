"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FileBarChart2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: "/daily-view", label: "Daily View", icon: CalendarDays },
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardFooter() {
  const pathname = usePathname();

  return (
    <footer className="border-t bg-background px-4 pt-8 pb-[calc(7.25rem+env(safe-area-inset-bottom)+var(--vv-offset-bottom))] md:px-6 md:pb-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold tracking-tight">Expense Tracker</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily spending, dashboard totals, and monthly reports.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col sm:flex-row sm:items-center">
          {footerLinks.map(({ href, label, icon: Icon }) => {
            const isActive = isActiveRoute(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
