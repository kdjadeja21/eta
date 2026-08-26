import type React from "react";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CurrencyProvider } from "@/components/currency-context";
import { CurrencyDropdown } from "@/components/currency-dropdown";
import { SideRailNav, MobileBottomNav } from "./dashboard-nav";

function Wordmark() {
  return (
    <Link href="/daily-view" className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="font-money flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
      >
        E
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          ETA
        </span>
        <span className="text-[11px] text-muted-foreground">
          Expense Tracker
        </span>
      </span>
    </Link>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <CurrencyProvider>
      <div className="min-h-dvh">
        {/* Desktop side rail */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card px-4 py-5 md:flex">
          <Wordmark />
          <div className="mt-8 flex-1">
            <SideRailNav />
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <CurrencyDropdown />
            <div className="flex items-center justify-between">
              <ModeToggle />
              <UserButton />
            </div>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
          <Wordmark />
          <div className="flex items-center gap-2">
            <CurrencyDropdown />
            <ModeToggle />
            <UserButton />
          </div>
        </header>

        <main className="pb-[calc(4rem+env(safe-area-inset-bottom)+var(--vv-offset-bottom))] md:pb-0 md:pl-60">
          {children}
        </main>

        <MobileBottomNav />
      </div>
    </CurrencyProvider>
  );
}
