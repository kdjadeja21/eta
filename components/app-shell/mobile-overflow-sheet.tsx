"use client";

import { UserButton } from "@clerk/nextjs";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { CurrencyDropdown } from "@/components/currency-dropdown";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Link from "next/link";

export function MobileOverflowTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 md:hidden"
        aria-label="Account and settings"
        onClick={() => setOpen(true)}
      >
        <MoreHorizontal className="size-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-lg pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle className="font-display text-left text-title">Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <p className="text-meta">Currency</p>
              <CurrencyDropdown />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-ui">Theme</p>
              <ModeToggle />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-ui">Account</p>
              <UserButton />
            </div>
            <Link
              href="/version"
              onClick={() => setOpen(false)}
              className="block text-ui text-muted-foreground underline-offset-4 hover:underline"
            >
              Version info
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
