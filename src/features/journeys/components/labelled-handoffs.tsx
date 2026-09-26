"use client";

import { Button } from "@/components/ui";
import {
  Callout,
  ExternalLinkButton,
  ItemCard,
  Panel,
  StatusBadge,
  Tag,
} from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import type { HandoffInput } from "../api";
import { useCreateHandoff } from "../queries";

export type HandoffTarget = HandoffInput & {
  providerName: string;
  title: string;
  subject: string;
  detail: string;
};

const PROVIDER_HANDOFFS: HandoffTarget[] = [
  {
    provider: "amazon",
    providerName: "Amazon",
    title: "Amazon Product & Cart Handoff (L0)",
    subject: "Product cart and checkout transfer",
    detail:
      "Transfers item selection and affiliate attribution to Amazon cart.",
    handoff: {
      asin: "B08N5WRWNW",
      locale: "US",
      quantity: 1,
      partner_tag: "vox-20",
    },
  },
  {
    provider: "zomato",
    providerName: "Zomato",
    title: "Zomato Restaurant & Table Handoff (L0)",
    subject: "Restaurant menu inspection and table reservation",
    detail: "Opens verified restaurant page in Zomato for consumer ordering.",
    handoff: {
      res_id: "18204",
      order_id: null,
      handoff_type: "ViewRestaurant",
    },
  },
  {
    provider: "uber",
    providerName: "Uber",
    title: "Uber Consumer Ride Request Handoff (L0)",
    subject: "Pickup and destination dispatch transfer",
    detail:
      "Passes route waypoints to the Uber application for ride request and fare confirmation.",
    handoff: {
      pickup_latitude: 37.7749,
      pickup_longitude: -122.4194,
      dropoff_latitude: 37.7833,
      dropoff_longitude: -122.4167,
      product_id: "uberx",
      fare_id: "fare_demo_456",
    },
  },
];

function HandoffCard({
  target,
  connectionId,
}: {
  target: HandoffTarget;
  connectionId: string;
}) {
  const handoff = useCreateHandoff();
  const result = handoff.data;

  return (
    <ItemCard
      title={target.title}
      subtitle={
        <>
          <strong className="font-medium text-mist">{target.subject}</strong>
          <br />
          {target.detail}
        </>
      }
      actions={
        <Button
          size="sm"
          disabled={handoff.isPending}
          aria-label={`Generate ${target.providerName} handoff link`}
          onClick={() => handoff.mutate({ ...target, connectionId })}
        >
          {handoff.isPending
            ? "Generating…"
            : `Generate ${target.providerName} handoff`}
        </Button>
      }
    >
      {handoff.isError ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(handoff.error, "Handoff failed")}</p>
        </Callout>
      ) : null}
      {result ? (
        <div role="status" className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex flex-wrap gap-2">
              <StatusBadge status={result.status} />
              <Tag
                tone={result.completed ? "positive" : "neutral"}
                label={`Completed state: ${result.completed ? "Completed" : "Incomplete (honest handoff)"}`}
              >
                {result.completed ? "✓" : "⊘"} Completed:{" "}
                {String(result.completed)}
              </Tag>
            </span>
            <ExternalLinkButton
              href={result.handoff_url}
              aria-label={`Continue to external ${target.providerName} application`}
            >
              Continue in {target.providerName}
            </ExternalLinkButton>
          </div>
          <p className="text-xs text-smoke">{result.disclaimer}</p>
        </div>
      ) : null}
    </ItemCard>
  );
}

export function LabelledHandoffs({ connectionId }: { connectionId: string }) {
  return (
    <Panel
      title="Labelled handoffs: honest provider boundaries (L0)"
      description="Direct execution is restricted to verified partner APIs. When consumer ordering is unavailable, Vox generates explicit labelled handoffs without claiming completion."
    >
      <Callout title="Handoff honesty">
        <p>
          Vox never marks an action complete because a handoff was opened or
          generated. Copy explicitly says &quot;Continue in [Provider]&quot;.
        </p>
      </Callout>
      <div className="grid gap-3 2xl:grid-cols-3">
        {PROVIDER_HANDOFFS.map((target) => (
          <HandoffCard
            key={target.provider}
            target={target}
            connectionId={connectionId}
          />
        ))}
      </div>
    </Panel>
  );
}
