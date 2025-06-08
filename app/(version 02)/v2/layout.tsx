import type React from "react";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CurrencyProvider } from "@/components/currency-context";
import { CurrencyDropdown } from "@/components/currency-dropdown";
import { DateRangeProvider } from "@/components/date-range-context";
import { DateRangePicker } from "@/components/date-range-picker";
import { NavBar } from "@/components/nav-bar";

export default async function V2Layout({
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
      <DateRangeProvider>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b bg-background">
            <div className="flex h-16 items-center px-4 md:px-6">
              <Link
                href="/v2/dashboard"
                className="flex items-center gap-2 font-semibold md:pr-6"
              >
                <span className="text-xl">💰</span>
                <span className="hidden sm:inline">Expense Tracker</span>
              </Link>
              <NavBar />
              <div className="flex items-center gap-2 md:gap-4">
                <DateRangePicker className="cursor-pointer" />
                <CurrencyDropdown />
                <ModeToggle />
                <UserButton afterSignOutUrl="/sign-in" />
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </DateRangeProvider>
    </CurrencyProvider>
  );
} 