"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-14 items-center px-6">
        <Link href="/sign-in" className="font-display text-xl tracking-tight">
          ETA
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-title">Create account</h1>
            <p className="mt-2 text-meta">Start tracking on paper.</p>
          </div>
          <SignUp />
        </div>
      </main>
    </div>
  );
}
