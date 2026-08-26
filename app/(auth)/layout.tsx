import type React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="font-money flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground"
        >
          E
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-base font-semibold tracking-tight text-foreground">
            ETA
          </span>
          <span className="text-xs text-muted-foreground">
            Expense Tracker
          </span>
        </span>
      </div>
      {children}
    </div>
  );
}
