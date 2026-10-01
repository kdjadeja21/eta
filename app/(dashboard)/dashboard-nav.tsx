"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, FileBarChart2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileAddExpense } from "./mobile-add-expense";

const navItems = [
  { href: "/daily-view", label: "Daily View", icon: CalendarDays },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navItems.map(({ href, label }) => {
        const isActive = isActiveRoute(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

const leftNavItems = navItems.slice(0, 2);
const rightNavItems = navItems.slice(2);

function MobileNavLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: (typeof navItems)[number]["icon"];
  pathname: string;
}) {
  const isActive = isActiveRoute(pathname, href);

  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium transition-colors",
        isActive ? "text-primary" : "text-muted-foreground active:bg-muted/50",
      )}
    >
      <Icon
        className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openAddExpense } = useMobileAddExpense();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-[var(--vv-offset-bottom)] z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      <div className="relative mx-auto flex h-16 max-w-lg items-stretch">
        <div className="flex min-w-0 flex-1">
          {leftNavItems.map((item) => (
            <MobileNavLink key={item.href} {...item} pathname={pathname} />
          ))}
        </div>
        <button
          type="button"
          onClick={openAddExpense}
          aria-label="Add expense"
          className={cn(
            "absolute left-1/2 top-0 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
            "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
            "shadow-[0_10px_24px_-6px_rgba(139,92,246,0.7)] ring-4 ring-background",
            "transition-transform active:scale-95",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
          )}
        >
          <Plus className="h-6 w-6 stroke-[2.5px]" aria-hidden />
        </button>
        <div className="w-[4.75rem] shrink-0" aria-hidden />
        <div className="flex min-w-0 flex-1">
          {rightNavItems.map((item) => (
            <MobileNavLink key={item.href} {...item} pathname={pathname} />
          ))}
        </div>
      </div>
    </nav>
  );
}
