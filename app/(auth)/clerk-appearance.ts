import type { ComponentProps } from "react";
import type { SignIn } from "@clerk/nextjs";

/*
 * Lumen theme for Clerk components. Surfaces use the app's CSS tokens via
 * Tailwind classes so they follow the light/dark toggle automatically.
 */
export const clerkAppearance: ComponentProps<typeof SignIn>["appearance"] = {
  variables: {
    colorPrimary: "#3e5c47",
    borderRadius: "0.75rem",
  },
  elements: {
    cardBox: "border border-border shadow-none",
    card: "bg-card",
    headerTitle: "text-foreground",
    headerSubtitle: "text-muted-foreground",
    formButtonPrimary:
      "bg-primary text-primary-foreground shadow-none hover:bg-primary/90",
    footer: "bg-none bg-card border-t border-border",
  },
};
