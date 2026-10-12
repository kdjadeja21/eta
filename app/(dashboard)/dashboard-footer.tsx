"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: "/daily-view", label: "Daily View" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reports", label: "Reports" },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  return (
    <footer className="px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom)+var(--vv-offset-bottom))] md:px-6 md:pb-0">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 border-t py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-3.5">
        <p className="text-xs leading-5 text-muted-foreground">
          <span className="font-medium text-foreground">Expense Tracker</span>
          <span className="px-1.5" aria-hidden>
            ·
          </span>
          <span>© {year}</span>
        </p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-4 gap-y-1"
        >
          {footerLinks.map(({ href, label }) => {
            const isActive = isActiveRoute(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
