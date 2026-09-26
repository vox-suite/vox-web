"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { Callout, Panel } from "@/components/app";
import { useAppHref } from "@/components/app-shell/app-paths";
import { errorMessage } from "@/lib/api/http";
import { usePortableExport } from "../queries";

const RECIPIENTS = [
  {
    name: "Expedia",
    detail:
      "Travel dates, destination, guest count, and payment details strictly during approved booking.",
  },
  {
    name: "Uber",
    detail: "Pickup/dropoff coordinates during ride request handoff.",
  },
  {
    name: "Amazon",
    detail: "ASIN item reference and quantity for cart continuation.",
  },
  {
    name: "Twilio / WhatsApp",
    detail: "Destination phone number and notification text for dispatch.",
  },
];

export function DataSharingPanel() {
  const href = useAppHref();
  const exportData = usePortableExport();

  return (
    <div className="grid items-start gap-6 2xl:grid-cols-2">
      <Panel
        title="Data recipients"
        description="External services only receive data necessary to execute approved actions."
      >
        <ul className="space-y-2 text-[13px]">
          {RECIPIENTS.map((recipient) => (
            <li
              key={recipient.name}
              className="rounded-md border border-border-edge bg-obsidian/50 px-3 py-2.5"
            >
              <p className="font-medium text-mist">{recipient.name}</p>
              <p className="text-smoke">{recipient.detail}</p>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
          <Link
            className="underline underline-offset-4"
            href={`${href("/apps")}#accounts`}
          >
            Manage &amp; disconnect integrations
          </Link>
          <Link
            className="underline underline-offset-4"
            href={`${href("/apps")}#access`}
          >
            Inspect &amp; revoke agent grants
          </Link>
        </div>
      </Panel>
      <Panel
        title="Portable data export"
        description="A documented portable representation of your non-secret preferences, configuration, and task history."
      >
        <Callout>
          <p>
            In accordance with platform safety guarantees,{" "}
            <strong>
              credentials, active approvals, and reusable authority are never
              exported
            </strong>
            .
          </p>
        </Callout>
        <Button
          variant="secondary"
          disabled={exportData.isPending}
          onClick={() => exportData.mutate()}
        >
          {exportData.isPending
            ? "Packaging export…"
            : "Generate portable export"}
        </Button>
        {exportData.isError ? (
          <Callout tone="danger" live="assertive">
            <p>{errorMessage(exportData.error, "Export failed")}</p>
          </Callout>
        ) : null}
        {exportData.isSuccess ? (
          <Callout
            tone="success"
            title={`Export ready: ${exportData.data.export.export_id}`}
            live="polite"
          >
            <p>{exportData.data.disclosure}</p>
          </Callout>
        ) : null}
      </Panel>
    </div>
  );
}
