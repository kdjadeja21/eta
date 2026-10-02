"use client";

import { useEffect, useRef, useState } from "react";
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

const BAR_HEIGHT = 80;
const TOP_PAD = 16;
const BUTTON_SIZE = 64;
const BUTTON_CENTER_FROM_BAR_TOP = 22;
const NOTCH_RADIUS = 37;
const FILLET = 14;
const SVG_HEIGHT = TOP_PAD + BAR_HEIGHT;
const BUTTON_CENTER_Y = TOP_PAD + BUTTON_CENTER_FROM_BAR_TOP;

function buildNotchPath(width: number) {
  const top = TOP_PAD;
  const bottom = TOP_PAD + BAR_HEIGHT;
  const endRadius = BAR_HEIGHT / 2;
  const cx = width / 2;
  const cy = BUTTON_CENTER_Y;
  const filletY = top + FILLET;
  const offsetY = filletY - cy;
  const tangentDistance = NOTCH_RADIUS + FILLET;
  const offsetX = Math.sqrt(
    tangentDistance * tangentDistance - offsetY * offsetY,
  );
  const leftFilletX = cx - offsetX;
  const rightFilletX = cx + offsetX;
  const leftTangentX = cx + ((leftFilletX - cx) / tangentDistance) * NOTCH_RADIUS;
  const leftTangentY = cy + (offsetY / tangentDistance) * NOTCH_RADIUS;
  const rightTangentX =
    cx + ((rightFilletX - cx) / tangentDistance) * NOTCH_RADIUS;
  const rightTangentY = cy + (offsetY / tangentDistance) * NOTCH_RADIUS;

  return [
    `M ${endRadius} ${top}`,
    `L ${leftFilletX} ${top}`,
    `A ${FILLET} ${FILLET} 0 0 1 ${leftTangentX} ${leftTangentY}`,
    `A ${NOTCH_RADIUS} ${NOTCH_RADIUS} 0 1 0 ${rightTangentX} ${rightTangentY}`,
    `A ${FILLET} ${FILLET} 0 0 1 ${rightFilletX} ${top}`,
    `L ${width - endRadius} ${top}`,
    `A ${endRadius} ${endRadius} 0 0 1 ${width - endRadius} ${bottom}`,
    `L ${endRadius} ${bottom}`,
    `A ${endRadius} ${endRadius} 0 0 1 ${endRadius} ${top}`,
    "Z",
  ].join(" ");
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openAddExpense } = useMobileAddExpense();
  const barRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(0);
  const activeHref = mobileNavItems.find((item) =>
    isActiveRoute(pathname, item.href),
  )?.href;
  const notchPath = barWidth > 0 ? buildNotchPath(barWidth) : undefined;

  useEffect(() => {
    const node = barRef.current;
    if (!node) return;

    const updateWidth = () => setBarWidth(node.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-[calc(0.65rem+env(safe-area-inset-bottom)+var(--vv-offset-bottom))] z-50 px-4 md:hidden"
    >
      <div
        ref={barRef}
        className="relative mx-auto max-w-lg"
        style={{ height: SVG_HEIGHT }}
      >
        <div
          className="absolute inset-0 bg-white/75 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:bg-slate-950/60 dark:shadow-[0_16px_40px_-18px_rgba(0,0,0,0.8)]"
          style={notchPath ? { clipPath: `path('${notchPath}')` } : undefined}
        >
          <div
            className="pointer-events-none absolute left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.55),transparent_68%)] blur-md"
            style={{ top: BUTTON_CENTER_Y - 56 }}
          />
          <div
            className={cn(
              "pointer-events-none absolute bottom-2 h-14 w-[42%] rounded-full blur-md",
              activeHref === "/daily-view" &&
                "left-3 bg-[radial-gradient(circle,rgba(110,231,183,0.28),transparent_68%)]",
              activeHref === "/dashboard" &&
                "right-3 bg-[radial-gradient(circle,rgba(110,231,183,0.22),transparent_68%)]",
            )}
          />
        </div>
        {notchPath ? (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            width={barWidth}
            height={SVG_HEIGHT}
          >
            <path
              d={notchPath}
              fill="none"
              className="stroke-slate-300/80 dark:stroke-white/15"
              strokeWidth="1"
            />
          </svg>
        ) : null}
        <div
          className="absolute inset-x-0 flex items-center"
          style={{ top: TOP_PAD, height: BAR_HEIGHT }}
        >
          <MobileNavLink {...mobileNavItems[0]} pathname={pathname} />
          <div className="w-[6.5rem] shrink-0" aria-hidden />
          <MobileNavLink {...mobileNavItems[1]} pathname={pathname} />
        </div>
        <button
          type="button"
          onClick={openAddExpense}
          aria-label="Add expense"
          className={cn(
            "absolute left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-full text-white",
            "bg-gradient-to-b from-indigo-400 via-violet-500 to-fuchsia-500",
            "shadow-[0_0_24px_6px_rgba(139,92,246,0.55)]",
            "transition-transform active:scale-95",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
          )}
          style={{
            top: BUTTON_CENTER_Y - BUTTON_SIZE / 2,
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
          }}
        >
          <Plus className="h-8 w-8 text-white" strokeWidth={3} aria-hidden />
        </button>
      </div>
    </nav>
  );
}
