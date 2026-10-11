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

const compactDateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

function formatUtcDate(isoString: string) {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat("en-US", {
    ...compactDateOptions,
    timeZone: "UTC",
  }).format(date);
}

function formatLocalDate(isoString: string) {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat(undefined, compactDateOptions).format(date);
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
    <Card className="w-full max-w-lg gap-[clamp(0.375rem,1.2vh,1rem)] py-[clamp(0.5rem,1.5vh,1.25rem)] [@media(max-height:560px)_and_(min-width:500px)]:max-w-4xl [@media(max-height:560px)_and_(min-width:500px)]:flex-row [@media(max-height:560px)_and_(min-width:500px)]:items-center [@media(max-height:560px)_and_(min-width:500px)]:gap-5 [@media(max-height:560px)_and_(min-width:500px)]:py-2">
      <CardHeader className="shrink-0 gap-0.5 px-4 text-center sm:px-5 [@media(max-height:560px)_and_(min-width:500px)]:w-56 [@media(max-height:560px)_and_(min-width:500px)]:px-4">
        <div className="mx-auto mb-1 flex size-8 items-center justify-center rounded-full bg-primary/10 [@media(max-height:640px)]:mb-0.5 [@media(max-height:640px)]:size-7">
          <Info className="size-4 text-primary" />
        </div>
        <CardTitle className="text-lg leading-tight sm:text-xl [@media(max-height:640px)]:text-base">
          Application Version
        </CardTitle>
        <CardDescription className="text-xs leading-snug sm:text-sm">
          Deployment details for the Expense Tracker app
        </CardDescription>
      </CardHeader>

      <CardContent className="min-w-0 flex-1 space-y-[clamp(0.375rem,1vh,0.625rem)] px-4 sm:px-5 [@media(max-height:560px)_and_(min-width:500px)]:px-4">
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2 [@media(max-height:640px)]:py-1.5">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Current Version
          </p>
          <Badge className="px-2.5 py-0.5 text-sm font-semibold">
            {version}
          </Badge>
        </div>

        <dl className="space-y-[clamp(0.375rem,1vh,0.5rem)]">
          <div className="flex items-center gap-2.5 rounded-lg border px-3 py-2 [@media(max-height:640px)]:py-1.5">
            <Clock className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-medium leading-tight sm:text-sm">
                Last Deployed (UTC)
              </dt>
              <dd className="text-xs leading-tight text-muted-foreground sm:text-sm">
                {formatUtcDate(lastUpdated)}
              </dd>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border px-3 py-2 [@media(max-height:640px)]:py-1.5">
            <Globe className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-medium leading-tight sm:text-sm">
                Last Deployed ({localTimezone})
              </dt>
              <dd className="text-xs leading-tight text-muted-foreground sm:text-sm">
                {formatLocalDate(lastUpdated)}
              </dd>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border px-3 py-2 [@media(max-height:640px)]:py-1.5">
            <Tag className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-medium leading-tight sm:text-sm">
                Stored Timezone
              </dt>
              <dd className="text-xs leading-tight text-muted-foreground sm:text-sm">
                {timezone}
              </dd>
            </div>
          </div>
        </dl>

        <p className="rounded-lg border border-dashed bg-muted/20 px-3 py-2 text-[11px] leading-snug text-muted-foreground sm:text-xs">
          This page is updated automatically on every production build. The JSON
          API is available at{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
            /api/version
          </code>
          .
        </p>
      </CardContent>
    </Card>
  );
}
