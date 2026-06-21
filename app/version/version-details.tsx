"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Globe, Info, Tag } from "lucide-react";

type VersionDetailsProps = {
  version: string;
  lastUpdated: string;
  timezone: string;
};

function formatUtcDate(isoString: string) {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function formatLocalDate(isoString: string) {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function getLocalTimezoneLabel() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function VersionDetails({
  version,
  lastUpdated,
  timezone,
}: VersionDetailsProps) {
  const localTimezone = getLocalTimezoneLabel();

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Info className="size-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Application Version</CardTitle>
        <CardDescription>
          Deployment details for the Expense Tracker app
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/30 px-4 py-6">
          <p className="text-sm text-muted-foreground">Current Version</p>
          <Badge className="px-4 py-1.5 text-base font-semibold">{version}</Badge>
        </div>

        <dl className="space-y-4">
          <div className="flex gap-3 rounded-lg border p-4">
            <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="space-y-1">
              <dt className="text-sm font-medium">Last Deployed (UTC)</dt>
              <dd className="text-sm text-muted-foreground">
                {formatUtcDate(lastUpdated)}
              </dd>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border p-4">
            <Globe className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="space-y-1">
              <dt className="text-sm font-medium">
                Last Deployed ({localTimezone})
              </dt>
              <dd className="text-sm text-muted-foreground">
                {formatLocalDate(lastUpdated)}
              </dd>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border p-4">
            <Tag className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="space-y-1">
              <dt className="text-sm font-medium">Stored Timezone</dt>
              <dd className="text-sm text-muted-foreground">{timezone}</dd>
            </div>
          </div>
        </dl>

        <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            This page is updated automatically on every production build.
            The JSON API is available at{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
              /api/version
            </code>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
