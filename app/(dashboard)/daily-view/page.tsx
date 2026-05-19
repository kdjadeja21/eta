import { auth } from "@clerk/nextjs/server";
import { DailyViewContent } from "./daily-view-content";

export default async function DailyViewPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in to access the daily view.</div>;
  }

  return <DailyViewContent userId={userId} />;
}
