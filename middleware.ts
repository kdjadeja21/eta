// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const publicRoutes = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
  "/((?!.+\\.[\\w]+$|_next).*)", // exclude static files and _next
]);

export default clerkMiddleware((auth, req) => {
  if (!publicRoutes(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
