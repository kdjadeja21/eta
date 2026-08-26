"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  AddExpenseProvider,
  useAddExpenseShortcut,
} from "./add-expense-context";
import { DesktopRail } from "./desktop-rail";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { MobileOverflowTrigger } from "./mobile-overflow-sheet";
import { cn } from "@/lib/utils";

function ShellShortcuts() {
  useAddExpenseShortcut(true);
  return null;
}

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isToday = pathname === "/daily-view" || pathname.startsWith("/daily-view/");

  return (
    <AddExpenseProvider>
      <ShellShortcuts />
      <div className="flex min-h-dvh bg-background">
        <DesktopRail />

        <div className="flex min-h-dvh flex-1 flex-col">
          {/* Mobile: overflow only on Today (no top header). Other routes get a minimal title bar. */}
          {isToday ? (
            <div className="flex justify-end px-3 pt-3 md:hidden">
              <MobileOverflowTrigger />
            </div>
          ) : (
            <header className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
              <PageTitle pathname={pathname} />
              <MobileOverflowTrigger />
            </header>
          )}

          <main
            className={cn(
              "flex-1",
              "pb-[calc(4.5rem+env(safe-area-inset-bottom)+var(--vv-offset-bottom))] md:pb-0"
            )}
          >
            {children}
          </main>

          <MobileBottomBar />
        </div>
      </div>
    </AddExpenseProvider>
  );
}

function PageTitle({ pathname }: { pathname: string }) {
  let title = "ETA";
  if (pathname.startsWith("/dashboard")) title = "Review";
  else if (pathname.startsWith("/reports/")) title = "Report";
  else if (pathname.startsWith("/reports")) title = "Reports";

  return <h1 className="font-display text-lg">{title}</h1>;
}
