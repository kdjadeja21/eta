"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutList, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { CurrencyDropdown } from "@/components/currency-dropdown";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/daily-view", label: "Today", icon: CalendarDays },
  { href: "/dashboard", label: "Review", icon: LayoutList },
  { href: "/reports", label: "Reports", icon: FileText },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopRail() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex md:w-[232px] md:shrink-0 md:flex-col md:border-r md:border-border md:bg-card"
      aria-label="Main navigation"
    >
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link href="/daily-view" className="font-display text-xl tracking-tight text-foreground">
          ETA
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActiveRoute(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 text-ui font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <CurrencyDropdown />
        <div className="flex items-center justify-between gap-2">
          <ModeToggle />
          <UserButton />
        </div>
        <Link
          href="/version"
          className="block text-meta text-muted-foreground transition-colors hover:text-foreground"
        >
          Version
        </Link>
      </div>
    </aside>
  );
}

export { NAV_ITEMS, isActiveRoute };
