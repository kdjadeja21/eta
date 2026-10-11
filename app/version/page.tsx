import type { Metadata } from "next";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import versionData from "@/lib/version.json";
import { VersionDetails } from "./version-details";
import { VersionScreen } from "./version-screen";

export const metadata: Metadata = {
  title: "Version | Expense Tracker",
  description: "Application version and deployment information",
};

export default function VersionPage() {
  return (
    <VersionScreen>
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4 md:px-6 [@media(max-height:560px)]:!h-10">
        <Link
          href="/daily-view"
          className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-80"
        >
          <span className="text-xl">💰</span>
          <span>Expense Tracker</span>
        </Link>
        <ModeToggle />
      </header>

      <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-2 sm:px-4 sm:py-3 [@media(max-height:560px)]:py-1.5 [@media(max-height:360px)]:py-1">
        <VersionDetails
          version={versionData.version}
          lastUpdated={versionData.lastUpdated}
          timezone={versionData.timezone}
        />
      </main>
    </VersionScreen>
  );
}
