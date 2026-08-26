import type { Metadata } from "next";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import versionData from "@/lib/version.json";
import { VersionDetails } from "./version-details";

export const metadata: Metadata = {
  title: "Version | ETA",
  description: "Application version and deployment information",
};

export default function VersionPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <Link href="/daily-view" className="font-display text-xl tracking-tight">
          ETA
        </Link>
        <ModeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-6 md:p-10">
        <VersionDetails
          version={versionData.version}
          lastUpdated={versionData.lastUpdated}
          timezone={versionData.timezone}
        />
      </main>
    </div>
  );
}
