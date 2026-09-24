"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Notice, Row, Stack, Text } from "@/components/ui";
import type { ActionProposal } from "@/lib/consumer-auth/core-host-client";
import {
  formatAuthoritativeCurrency,
  formatAuthoritativeDateTime,
  getAccessibleStatusIndicator,
} from "@/lib/global-formatting";

export function ProposalsManager({
  initialProposals = [],
}: {
  initialProposals?: ActionProposal[];
}) {
  const [proposals, setProposals] =
    useState<ActionProposal[]>(initialProposals);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  async function handleApprove(proposal: ActionProposal) {
    try {
      setSubmittingId(proposal.id);
      setActionError(null);
      setActionSuccess(null);

      const res = await fetch(
        `/api/account/proposals/${encodeURIComponent(proposal.id)}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ details: proposal.details }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Approval rejected by Core validation");
      }

      const data = await res.json();
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposal.id
            ? {
                ...p,
                state: "approved",
                approval_id: data.proposal.approval_id,
              }
            : p,
        ),
      );
      setActionSuccess(
        `Proposal ${proposal.id} successfully approved and bound.`,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleReject(proposalId: string) {
    try {
      setSubmittingId(proposalId);
      setActionError(null);
      setActionSuccess(null);

      const res = await fetch(
        `/api/account/proposals/${encodeURIComponent(proposalId)}/reject`,
        {
          method: "POST",
        },
      );

      if (!res.ok) throw new Error("Rejection failed");

      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, state: "superseded" } : p,
        ),
      );
      setActionSuccess(
        `Proposal ${proposalId} rejected. The agent will not execute this action.`,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setSubmittingId(null);
    }
  }

  function isExpired(proposal: ActionProposal): boolean {
    if (proposal.state === "expired") return true;
    return new Date(proposal.expires_at).getTime() <= now;
  }

  function isSuperseded(proposal: ActionProposal): boolean {
    return proposal.state === "superseded";
  }

  return (
    <Stack gap="normal">
      <Card
        title="Exact Action Proposals & Approvals"
        description="Inspect material details before executing consequential actions. Client flags are never trusted; Core verifies exact signed details."
        tone="soft"
      >
        <Stack gap="normal">
          <div className="p-3 bg-obsidian border border-border-edge rounded-lg text-sm text-mist">
            <strong>Exact-Match Binding:</strong> Approvals require an exact,
            byte-for-byte match with the proposal hash stored in Core. If
            details, pricing, recipients, or timing change, existing proposals
            are immediately invalidated and require a new decision.
          </div>

          {actionError && (
            <div role="alert" aria-live="assertive">
              <Notice title="Decision Error" tone="error">
                {actionError}
              </Notice>
            </div>
          )}
          {actionSuccess && (
            <div role="status" aria-live="polite">
              <Notice title="Decision Recorded" tone="success">
                {actionSuccess}
              </Notice>
            </div>
          )}

          {proposals.length === 0 && (
            <Text muted>
              No pending action proposals requiring your decision.
            </Text>
          )}

          <div className="space-y-6">
            {proposals.map((proposal) => {
              const details = proposal.details || {};
              const expired = isExpired(proposal);
              const superseded = isSuperseded(proposal);
              const approved = proposal.state === "approved";
              const isPending = !expired && !superseded && !approved;

              const statusKey = expired
                ? "expired"
                : superseded
                  ? "superseded"
                  : approved
                    ? "approved"
                    : "pending";
              const statusIndicator = getAccessibleStatusIndicator(statusKey);

              return (
                <div
                  key={proposal.id}
                  role="region"
                  aria-labelledby={`proposal-title-${proposal.id}`}
                  className="p-5 border border-border-edge bg-ink rounded-lg space-y-4 focus-within:ring-1 focus-within:ring-slate"
                  data-testid={`proposal-${proposal.id}`}
                >
                  <Row spread>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-ash font-mono">
                        {proposal.capability_external_key}
                      </span>
                      <h4
                        id={`proposal-title-${proposal.id}`}
                        className="text-base font-semibold text-pure-white"
                      >
                        {details.title || "Action Proposal"}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={statusIndicator.badgeTone}
                        aria-label={statusIndicator.ariaLabel}
                        className="flex items-center gap-1.5"
                      >
                        <span aria-hidden="true">{statusIndicator.symbol}</span>
                        <span>{statusIndicator.text}</span>
                      </Badge>
                    </div>
                  </Row>

                  {expired && (
                    <Notice title="Proposal Expired" tone="error">
                      This action proposal has expired. You cannot approve it. A
                      fresh quote or new proposal is required.
                    </Notice>
                  )}

                  {superseded && (
                    <Notice title="Details Changed / Superseded" tone="error">
                      The details or parameters of this proposal have changed.
                      Existing decisions are void and require a new decision.
                    </Notice>
                  )}

                  {/* Material Action Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-obsidian/50 rounded border border-border-edge text-xs">
                    <div>
                      <span className="text-smoke">Service Provider:</span>{" "}
                      <strong className="text-mist">
                        {details.provider || "Direct / Core"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-smoke">Connected Account:</span>{" "}
                      <strong className="text-mist">
                        {details.account_reference ||
                          "Default Platform Context"}
                      </strong>
                    </div>
                    {details.recipient && (
                      <div>
                        <span className="text-smoke">Recipient:</span>{" "}
                        <strong className="text-mist">
                          {details.recipient}
                        </strong>
                      </div>
                    )}
                    {details.location && (
                      <div>
                        <span className="text-smoke">Location:</span>{" "}
                        <strong className="text-mist">
                          {details.location}
                        </strong>
                      </div>
                    )}
                    {details.time && (
                      <div>
                        <span className="text-smoke">Scheduled Time:</span>{" "}
                        <strong className="text-mist">{details.time}</strong>
                      </div>
                    )}
                    {details.price !== undefined &&
                      (() => {
                        const authCurr = formatAuthoritativeCurrency(
                          details.price,
                          details.currency || "USD",
                        );
                        return (
                          <div>
                            <span className="text-smoke">Exact Price:</span>{" "}
                            <strong
                              className="text-pure-white font-mono text-sm"
                              aria-label={authCurr.ariaLabel}
                            >
                              {authCurr.formattedAmount}
                            </strong>
                            <span className="text-[10px] text-smoke block">
                              (authoritative provider quote · no currency
                              conversion)
                            </span>
                          </div>
                        );
                      })()}
                    {details.fees !== undefined &&
                      (() => {
                        const authFees = formatAuthoritativeCurrency(
                          details.fees,
                          details.currency || "USD",
                        );
                        return (
                          <div>
                            <span className="text-smoke">
                              Mandatory Fees / Taxes:
                            </span>{" "}
                            <strong
                              className="text-mist font-mono"
                              aria-label={authFees.ariaLabel}
                            >
                              {authFees.formattedAmount}
                            </strong>
                          </div>
                        );
                      })()}
                    {(() => {
                      const authDate = formatAuthoritativeDateTime(
                        proposal.expires_at,
                        "UTC",
                      );
                      return (
                        <div>
                          <span className="text-smoke">Expires At:</span>{" "}
                          <span
                            className="text-ash font-mono"
                            aria-label={authDate.ariaLabel}
                          >
                            {authDate.formattedDateTime} (
                            {authDate.authoritativeTimezone})
                          </span>
                        </div>
                      );
                    })()}
                    {details.data_recipients &&
                      details.data_recipients.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="text-smoke">Data Recipients:</span>{" "}
                          <span className="text-ash">
                            {details.data_recipients.join(", ")}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Content / Instruction Body */}
                  {details.content && (
                    <div className="p-3 bg-obsidian/30 rounded border border-slate text-xs text-mist">
                      <strong className="text-ash block mb-1">
                        Proposed Content:
                      </strong>
                      <p>{details.content}</p>
                    </div>
                  )}

                  {/* Grouped Actions Breakdown (Preserves Separate Action Details & Outcomes) */}
                  {details.grouped_actions &&
                    details.grouped_actions.length > 0 && (
                      <div className="space-y-2 border-t border-slate pt-3">
                        <span className="text-xs font-semibold text-mist uppercase tracking-wide">
                          Grouped Actions Breakdown (
                          {details.grouped_actions.length} individual items)
                        </span>
                        <div className="space-y-2">
                          {details.grouped_actions.map((act) => {
                            const actIndicator = getAccessibleStatusIndicator(
                              act.outcome || "pending",
                            );
                            const actCurr =
                              act.price !== undefined
                                ? formatAuthoritativeCurrency(
                                    act.price,
                                    details.currency || "USD",
                                  )
                                : null;
                            return (
                              <div
                                key={act.action_id}
                                className="p-3 bg-obsidian/70 border border-border-edge rounded flex items-center justify-between text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-medium text-mist">
                                    {act.description}
                                  </div>
                                  <div className="text-smoke">
                                    Provider: {act.provider || "N/A"} · ID:{" "}
                                    {act.action_id}
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  {actCurr && (
                                    <div
                                      className="font-mono text-pure-white font-medium"
                                      aria-label={actCurr.ariaLabel}
                                    >
                                      {actCurr.formattedAmount}
                                    </div>
                                  )}
                                  <Badge
                                    tone={actIndicator.badgeTone}
                                    aria-label={actIndicator.ariaLabel}
                                    className="flex items-center gap-1"
                                  >
                                    <span aria-hidden="true">
                                      {actIndicator.symbol}
                                    </span>
                                    <span>{actIndicator.text}</span>
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Decision Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate">
                    <Button
                      variant="ghost"
                      aria-label={`Reject action proposal: ${details.title || proposal.id}`}
                      disabled={submittingId === proposal.id || !isPending}
                      onClick={() => handleReject(proposal.id)}
                    >
                      Reject Action
                    </Button>
                    <Button
                      variant="primary"
                      aria-label={`Approve exact action proposal: ${details.title || proposal.id}`}
                      disabled={submittingId === proposal.id || !isPending}
                      onClick={() => handleApprove(proposal)}
                    >
                      {submittingId === proposal.id
                        ? "Validating with Core..."
                        : "Approve Exact Action"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
