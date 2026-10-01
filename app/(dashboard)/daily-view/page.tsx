import { auth } from "@clerk/nextjs/server";
import { DailyViewContent } from "./daily-view-content";

export default async function DailyViewPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;

  if (!userId) {
    return <div>Please sign in to access the daily view.</div>;
  }

  return (
    <DailyViewContent userId={userId} initialAddOpen={params.add === "1"} />
  );
}
