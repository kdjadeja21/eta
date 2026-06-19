import { auth } from "@clerk/nextjs/server";
import { ReportsContent } from "./reports-content";

export default async function ReportsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in to access reports.</div>;
  }

  return <ReportsContent userId={userId} />;
}
