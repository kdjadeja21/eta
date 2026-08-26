"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Globe, Tag } from "lucide-react";

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
    <Card className="w-full max-w-md rounded-md border-border shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-title">Version</CardTitle>
        <CardDescription className="text-meta">Build and deploy details</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-muted/40 px-4 py-6">
          <p className="text-meta">Current</p>
          <p className="font-mono-version text-2xl tracking-tight text-foreground">{version}</p>
        </div>

        <dl className="space-y-3 text-ui">
          <div className="flex gap-3 rounded-md border border-border p-4">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="font-medium">Deployed (UTC)</dt>
              <dd className="text-meta mt-0.5">{formatUtcDate(lastUpdated)}</dd>
            </div>
          </div>

          <div className="flex gap-3 rounded-md border border-border p-4">
            <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="font-medium">Deployed ({localTimezone})</dt>
              <dd className="text-meta mt-0.5">{formatLocalDate(lastUpdated)}</dd>
            </div>
          </div>

          <div className="flex gap-3 rounded-md border border-border p-4">
            <Tag className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="font-medium">Stored timezone</dt>
              <dd className="font-mono-version text-meta mt-0.5">{timezone}</dd>
            </div>
          </div>
        </dl>

        <p className="text-meta border-t border-border pt-4">
          JSON at{" "}
          <code className="font-mono-version rounded bg-muted px-1 py-0.5 text-[11px]">
            /api/version
          </code>
        </p>
      </CardContent>
    </Card>
  );
}
