import { NextResponse } from "next/server";
import versionData from "@/lib/version.json";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    version: versionData.version,
    lastUpdated: versionData.lastUpdated,
    timezone: versionData.timezone,
  });
}
