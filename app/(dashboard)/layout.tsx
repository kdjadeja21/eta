import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CurrencyProvider } from "@/components/currency-context";
import { AppShell } from "@/components/app-shell/app-shell";

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
      <AppShell>{children}</AppShell>
    </CurrencyProvider>
  );
}
