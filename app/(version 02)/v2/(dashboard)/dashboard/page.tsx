import { DashboardContent } from "./dashboard-content";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  // Removed auth check to allow access without signing in
  // Using a placeholder userId for unauthenticated users
  const { userId } = await auth();

  if (!userId) {
    // Redirect to sign-in page if userId is not available
    return <div>Please sign in to access the dashboard.</div>;
  }

  return <DashboardContent userId={userId} />;
}
