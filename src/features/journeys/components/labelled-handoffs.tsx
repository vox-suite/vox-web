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
import { useCreateHandoff } from "../queries";
import { HANDOFF_SAMPLES, type HandoffSample } from "../samples";

function HandoffCard({
  sample,
  connectionId,
}: {
  sample: HandoffSample;
  connectionId: string;
}) {
  const handoff = useCreateHandoff();
  const result = handoff.data;

  return (
    <ItemCard
      title={sample.title}
      subtitle={
        <>
          <strong className="font-medium text-mist">{sample.subject}</strong>
          <br />
          {sample.detail}
        </>
      }
      actions={
        <Button
          size="sm"
          disabled={handoff.isPending}
          aria-label={`Generate ${sample.providerName} handoff link`}
          onClick={() => handoff.mutate({ ...sample, connectionId })}
        >
          {handoff.isPending
            ? "Generating…"
            : `Generate ${sample.providerName} handoff`}
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
              aria-label={`Continue to external ${sample.providerName} application`}
            >
              Continue in {sample.providerName}
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
        {HANDOFF_SAMPLES.map((sample) => (
          <HandoffCard
            key={sample.provider}
            sample={sample}
            connectionId={connectionId}
          />
        ))}
      </div>
    </Panel>
  );
}
