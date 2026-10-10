import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthToast } from "@/components/auth-toast";
import { VisualViewportOffset } from "@/components/visual-viewport-offset";
import { VISUAL_VIEWPORT_INLINE_SCRIPT } from "@/lib/visual-viewport";

const plexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Expense Tracker App",
  description:
    "Track your expenses, manage budgets, and gain insights into your spending with our intuitive expense tracker.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/daily-view"
      signUpFallbackRedirectUrl="/daily-view"
      afterSignOutUrl="/sign-in"
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{ __html: VISUAL_VIEWPORT_INLINE_SCRIPT }}
          />
        </head>
        <body
          className={`${plexSans.variable} ${plexMono.variable} antialiased`}
        >
          <VisualViewportOffset />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster
            position="top-right"
            richColors
            visibleToasts={3}
            theme="light"
          />
          <AuthToast />
        </body>
      </html>
    </ClerkProvider>
  );
}
