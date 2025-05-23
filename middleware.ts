// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/((?!.+\\.[\\w]+$|_next).*)", // protect all routes except static files and _next
  "/", 
  "/(api|trpc)(.*)",            // include your API routes if needed
  "/settings(.*)",              // explicitly include settings route
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", // protect all routes except static files and _next
    "/", 
    "/(api|trpc)(.*)",            // include your API routes if needed
  ],
};
