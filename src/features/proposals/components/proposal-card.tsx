"use client";

import { Button } from "@/components/ui";
import {
  Callout,
  ItemCard,
  Labelled,
  MetaList,
  StatusBadge,
} from "@/components/app";
import type { ActionProposal } from "@/lib/consumer-auth/core-host-client";
import {
  formatAuthoritativeCurrency,
  formatAuthoritativeDateTime,
} from "@/lib/global-formatting";
import type { ProposalStatus } from "../api";

function Amount({ value, currency }: { value: number; currency: string }) {
  const amount = formatAuthoritativeCurrency(value, currency);
  return (
    <strong className="font-mono text-pure-white">
      <Labelled label={amount.ariaLabel}>{amount.formattedAmount}</Labelled>
    </strong>
  );
}

export function ProposalCard({
  proposal,
  status,
  submitting,
  onApprove,
  onReject,
}: {
  proposal: ActionProposal;
  status: ProposalStatus;
  submitting: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const details = proposal.details || {};
  const currency = details.currency || "USD";
  const expires = formatAuthoritativeDateTime(proposal.expires_at, "UTC");
  const label = details.title || proposal.id;
  const decidable = status === "pending";

  return (
    <ItemCard
      testId={`proposal-${proposal.id}`}
      eyebrow={proposal.capability_external_key}
      title={details.title || "Action proposal"}
      badges={<StatusBadge status={status} />}
      footer={
        <>
          <span />
          <span className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Reject action proposal: ${label}`}
              disabled={submitting || !decidable}
              onClick={onReject}
            >
              Reject action
            </Button>
            <Button
              size="sm"
              aria-label={`Approve exact action proposal: ${label}`}
              disabled={submitting || !decidable}
              onClick={onApprove}
            >
              {submitting ? "Validating with Core…" : "Approve exact action"}
            </Button>
          </span>
        </>
      }
    >
      {status === "expired" ? (
        <Callout tone="danger" title="Proposal expired">
          <p>
            This proposal has expired and cannot be approved. A fresh quote or
            new proposal is required.
          </p>
        </Callout>
      ) : null}
      {status === "superseded" ? (
        <Callout tone="danger" title="Details changed / superseded">
          <p>
            The details of this proposal changed. Existing decisions are void
            and require a new decision.
          </p>
        </Callout>
      ) : null}
      <MetaList
        items={[
          {
            label: "Service provider",
            value: details.provider || "Direct / Core",
          },
          {
            label: "Connected account",
            value: details.account_reference || "Default Platform Context",
          },
          details.recipient
            ? { label: "Recipient", value: details.recipient }
            : null,
          details.location
            ? { label: "Location", value: details.location }
            : null,
          details.time
            ? { label: "Scheduled time", value: details.time }
            : null,
          details.price !== undefined
            ? {
                label: "Exact price (provider quote, no conversion)",
                value: <Amount value={details.price} currency={currency} />,
              }
            : null,
          details.fees !== undefined
            ? {
                label: "Mandatory fees / taxes",
                value: <Amount value={details.fees} currency={currency} />,
              }
            : null,
          {
            label: "Expires at",
            value: (
              <span className="font-mono">
                <Labelled label={expires.ariaLabel}>
                  {expires.formattedDateTime} ({expires.authoritativeTimezone})
                </Labelled>
              </span>
            ),
          },
          details.data_recipients?.length
            ? {
                label: "Data recipients",
                value: details.data_recipients.join(", "),
                wide: true,
              }
            : null,
        ]}
      />
      {details.content ? (
        <div className="rounded-md border border-border-edge bg-ink p-3 text-[13px]">
          <p className="mb-1 text-xs text-smoke">Proposed content</p>
          <p className="whitespace-pre-wrap break-words text-mist">
            {details.content}
          </p>
        </div>
      ) : null}
      {details.grouped_actions?.length ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-mist">
            Grouped actions ({details.grouped_actions.length} individual items)
          </p>
          <ul className="space-y-2">
            {details.grouped_actions.map((action) => (
              <li
                key={action.action_id}
                className="flex flex-col gap-2 rounded-md border border-border-edge bg-ink p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-mist">{action.description}</p>
                  <p className="text-smoke">
                    Provider: {action.provider || "N/A"} · ID:{" "}
                    {action.action_id}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {action.price !== undefined ? (
                    <Amount value={action.price} currency={currency} />
                  ) : null}
                  <StatusBadge status={action.outcome || "pending"} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </ItemCard>
  );
}
