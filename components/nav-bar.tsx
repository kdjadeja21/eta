"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/date-range-picker";

const routes = [
  {
    href: "/v2/dashboard",
    label: "Dashboard",
  },
  {
    href: "/v2/transactions",
    label: "Transactions",
  },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <div className="flex-1 flex items-center justify-between md:justify-start">
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-accent"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-6">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-xl font-semibold">Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-6">
            <nav className="flex flex-col gap-2">
              {routes.map((route) => (
                <SheetClose key={route.href} asChild>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all",
                      pathname === route.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {route.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              pathname === route.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </div>
  );
} 