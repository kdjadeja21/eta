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
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-2 text-[12px] font-medium transition-colors",
        isActive ? "text-primary" : "text-slate-500 dark:text-slate-300",
      )}
    >
      <Icon
        className={cn("h-[22px] w-[22px]", isActive ? "stroke-[2.25px]" : "stroke-[1.75px]")}
        aria-hidden
      />
      <span className="truncate">{label}</span>
      <span
        className={cn(
          "mt-0.5 h-[3px] w-6 rounded-full",
          isActive
            ? "bg-primary shadow-[0_0_10px_var(--primary)]"
            : "bg-transparent",
        )}
      />
    </Link>
  );
}

const notchMask =
  "radial-gradient(circle at 50% 4px, transparent 47px, #000 48px)";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openAddExpense } = useMobileAddExpense();
  const activeHref = mobileNavItems.find((item) =>
    isActiveRoute(pathname, item.href),
  )?.href;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-[calc(0.65rem+env(safe-area-inset-bottom)+var(--vv-offset-bottom))] z-50 px-4 md:hidden"
    >
      <div className="relative mx-auto h-[5.75rem] max-w-lg">
        <div
          className="absolute inset-x-0 bottom-0 flex h-[4.5rem] items-center overflow-hidden rounded-full border border-slate-200/80 bg-white/75 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-[0_16px_40px_-18px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.14)]"
          style={{ maskImage: notchMask, WebkitMaskImage: notchMask }}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-y-2 w-[42%] rounded-full blur-md",
              activeHref === "/daily-view" &&
                "left-3 bg-[radial-gradient(circle,rgba(110,231,183,0.28),transparent_68%)]",
              activeHref === "/dashboard" &&
                "right-3 bg-[radial-gradient(circle,rgba(110,231,183,0.22),transparent_68%)]",
            )}
          />
          <MobileNavLink {...mobileNavItems[0]} pathname={pathname} />
          <div className="w-[5.75rem] shrink-0" aria-hidden />
          <MobileNavLink {...mobileNavItems[1]} pathname={pathname} />
        </div>
        <button
          type="button"
          onClick={openAddExpense}
          aria-label="Add expense"
          className={cn(
            "absolute bottom-[22px] left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-white",
            "bg-gradient-to-br from-indigo-400 via-violet-500 to-fuchsia-500",
            "shadow-[0_0_0_5px_var(--background),0_10px_28px_-6px_rgba(139,92,246,0.85)]",
            "transition-transform active:scale-95",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
          )}
        >
          <Plus className="h-6 w-6 stroke-[2.5px]" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
