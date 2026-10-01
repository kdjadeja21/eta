"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FileBarChart2, LayoutGrid, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileAddExpense } from "./mobile-add-expense";

const navItems = [
  { href: "/daily-view", label: "Daily View", icon: CalendarDays },
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
] as const;

const mobileNavItems = [navItems[0], navItems[1]] as const;

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

function MobileNavLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: (typeof mobileNavItems)[number]["icon"];
  pathname: string;
}) {
  const isActive = isActiveRoute(pathname, href);

  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 text-[12px] font-medium tracking-tight transition-colors",
        isActive ? "text-emerald-300" : "text-slate-300/80",
      )}
    >
      <Icon
        className={cn(
          "h-[22px] w-[22px]",
          isActive ? "stroke-[1.75px]" : "stroke-[1.5px]",
        )}
        aria-hidden
      />
      <span className="truncate">{label}</span>
      <span
        className={cn(
          "h-[3px] w-7 rounded-full",
          isActive
            ? "bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.7)]"
            : "bg-transparent",
        )}
      />
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openAddExpense } = useMobileAddExpense();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom)+var(--vv-offset-bottom))] z-50 px-5 md:hidden"
    >
      <div className="relative mx-auto h-16 max-w-md">
        <div
          className={cn(
            "absolute inset-0 rounded-[28px]",
            "bg-[#0b1020]/80 shadow-[0_18px_40px_-20px_rgba(2,6,23,0.85)]",
            "ring-1 ring-white/10 backdrop-blur-2xl",
            "before:pointer-events-none before:absolute before:inset-px before:rounded-[27px]",
            "before:bg-gradient-to-b before:from-white/10 before:to-transparent",
          )}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-[70%] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.45),transparent_68%)] blur-xl"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center px-2">
          <MobileNavLink {...mobileNavItems[0]} pathname={pathname} />
          <div className="w-16 shrink-0" aria-hidden />
          <MobileNavLink {...mobileNavItems[1]} pathname={pathname} />
        </div>
        <button
          type="button"
          onClick={openAddExpense}
          aria-label="Add expense"
          className={cn(
            "absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-[62%] items-center justify-center rounded-full text-white",
            "bg-gradient-to-b from-[#c4b5fd] via-[#8b5cf6] to-[#7c3aed]",
            "shadow-[0_10px_22px_-4px_rgba(124,58,237,0.55)]",
            "transition-transform active:scale-95",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
          )}
        >
          <Plus className="h-6 w-6" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </nav>
  );
}
