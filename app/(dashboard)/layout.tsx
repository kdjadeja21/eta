import type React from "react";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CurrencyProvider } from "@/components/currency-context";
import { CurrencyDropdown } from "@/components/currency-dropdown";
import { DashboardNav, MobileBottomNav } from "./dashboard-nav";

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
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Link
            href="/daily-view"
            className="flex items-center gap-2 font-semibold"
          >
            <span className="text-xl">💰</span>
            <span>Expense Tracker</span>
          </Link>
          <DashboardNav />
          <div className="ml-auto flex items-center gap-4">
            <CurrencyDropdown />
            <ModeToggle />
            <UserButton />
          </div>
        </header>
        <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </CurrencyProvider>
  );
}
