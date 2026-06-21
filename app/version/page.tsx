import type { Metadata } from "next";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import versionData from "@/lib/version.json";
import { VersionDetails } from "./version-details";

export const metadata: Metadata = {
  title: "Version | Expense Tracker",
  description: "Application version and deployment information",
};

export default function VersionPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <Link
          href="/daily-view"
          className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-80"
        >
          <span className="text-xl">💰</span>
          <span>Expense Tracker</span>
        </Link>
        <ModeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <VersionDetails
          version={versionData.version}
          lastUpdated={versionData.lastUpdated}
          timezone={versionData.timezone}
        />
      </main>
    </div>
  );
}
