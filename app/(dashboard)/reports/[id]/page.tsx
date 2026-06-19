import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ReportContent } from "./report-content";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { userId } = await auth();
  if (!userId) {
    return <div>Please sign in to view reports.</div>;
  }

  const { id } = await params;

  return <ReportContent reportId={id} userId={userId} />;
}
