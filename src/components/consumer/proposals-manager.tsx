"use client";

import { useState } from "react";
import { Badge, Button, Card, Notice, Row, Stack, Text } from "@/components/ui";
import type { ActionProposal, MaterialProposalDetails } from "@/lib/consumer-auth/core-host-client";

export function ProposalsManager({
  initialProposals = [],
}: {
  initialProposals?: ActionProposal[];
}) {
  const [proposals, setProposals] = useState<ActionProposal[]>(initialProposals);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  async function handleApprove(proposal: ActionProposal) {
    try {
      setSubmittingId(proposal.id);
      setActionError(null);
      setActionSuccess(null);

      const res = await fetch(`/api/account/proposals/${encodeURIComponent(proposal.id)}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details: proposal.details }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Approval rejected by Core validation");
      }

      const data = await res.json();
      setProposals((prev) =>
        prev.map((p) => (p.id === proposal.id ? { ...p, state: "approved", approval_id: data.proposal.approval_id } : p)),
      );
      setActionSuccess(`Proposal ${proposal.id} successfully approved and bound.`);
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

      const res = await fetch(`/api/account/proposals/${encodeURIComponent(proposalId)}/reject`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Rejection failed");

      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, state: "superseded" } : p)),
      );
      setActionSuccess(`Proposal ${proposalId} rejected. The agent will not execute this action.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setSubmittingId(null);
    }
  }

  function isExpired(proposal: ActionProposal): boolean {
    if (proposal.state === "expired") return true;
    return new Date(proposal.expires_at).getTime() <= Date.now();
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
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300">
            <strong>Exact-Match Binding:</strong> Approvals require an exact, byte-for-byte match with the proposal hash stored in Core. If details, pricing, recipients, or timing change, existing proposals are immediately invalidated and require a new decision.
          </div>

          {actionError && <Notice title="Decision Error" tone="error">{actionError}</Notice>}
          {actionSuccess && <Notice title="Decision Recorded" tone="success">{actionSuccess}</Notice>}

          {proposals.length === 0 && (
            <Text muted>No pending action proposals requiring your decision.</Text>
          )}

          <div className="space-y-6">
            {proposals.map((proposal) => {
              const details = proposal.details || {};
              const expired = isExpired(proposal);
              const superseded = isSuperseded(proposal);
              const approved = proposal.state === "approved";
              const isPending = !expired && !superseded && !approved;

              return (
                <div
                  key={proposal.id}
                  className="p-5 border border-neutral-800 bg-neutral-950 rounded-lg space-y-4"
                  data-testid={`proposal-${proposal.id}`}
                >
                  <Row spread>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-neutral-400 font-mono">
                        {proposal.capability_external_key}
                      </span>
                      <h4 className="text-base font-semibold text-neutral-100">
                        {details.title || "Action Proposal"}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {expired && <Badge tone="warning">EXPIRED</Badge>}
                      {superseded && <Badge tone="warning">SUPERSEDED</Badge>}
                      {approved && <Badge tone="positive">APPROVED</Badge>}
                      {isPending && <Badge tone="accent">AWAITING DECISION</Badge>}
                    </div>
                  </Row>

                  {expired && (
                    <Notice title="Proposal Expired" tone="error">
                      This action proposal has expired. You cannot approve it. A fresh quote or new proposal is required.
                    </Notice>
                  )}

                  {superseded && (
                    <Notice title="Details Changed / Superseded" tone="error">
                      The details or parameters of this proposal have changed. Existing decisions are void and require a new decision.
                    </Notice>
                  )}

                  {/* Material Action Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-neutral-900/50 rounded border border-neutral-800 text-xs">
                    <div>
                      <span className="text-neutral-500">Service Provider:</span>{" "}
                      <strong className="text-neutral-200">{details.provider || "Direct / Core"}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-500">Connected Account:</span>{" "}
                      <strong className="text-neutral-200">{details.account_reference || "Default Platform Context"}</strong>
                    </div>
                    {details.recipient && (
                      <div>
                        <span className="text-neutral-500">Recipient:</span>{" "}
                        <strong className="text-neutral-200">{details.recipient}</strong>
                      </div>
                    )}
                    {details.location && (
                      <div>
                        <span className="text-neutral-500">Location:</span>{" "}
                        <strong className="text-neutral-200">{details.location}</strong>
                      </div>
                    )}
                    {details.time && (
                      <div>
                        <span className="text-neutral-500">Scheduled Time:</span>{" "}
                        <strong className="text-neutral-200">{details.time}</strong>
                      </div>
                    )}
                    {details.price !== undefined && (
                      <div>
                        <span className="text-neutral-500">Exact Price:</span>{" "}
                        <strong className="text-neutral-100 font-mono text-sm">
                          {details.currency || "USD"} {Number(details.price).toFixed(2)}
                        </strong>
                      </div>
                    )}
                    {details.fees !== undefined && (
                      <div>
                        <span className="text-neutral-500">Mandatory Fees / Taxes:</span>{" "}
                        <strong className="text-neutral-300 font-mono">
                          {details.currency || "USD"} {Number(details.fees).toFixed(2)}
                        </strong>
                      </div>
                    )}
                    <div>
                      <span className="text-neutral-500">Expires At:</span>{" "}
                      <span className="text-neutral-400 font-mono">{new Date(proposal.expires_at).toLocaleString()}</span>
                    </div>
                    {details.data_recipients && details.data_recipients.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="text-neutral-500">Data Recipients:</span>{" "}
                        <span className="text-neutral-400">{details.data_recipients.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {/* Content / Instruction Body */}
                  {details.content && (
                    <div className="p-3 bg-neutral-900/30 rounded border border-neutral-900 text-xs text-neutral-300">
                      <strong className="text-neutral-400 block mb-1">Proposed Content:</strong>
                      <p>{details.content}</p>
                    </div>
                  )}

                  {/* Grouped Actions Breakdown (Preserves Separate Action Details & Outcomes) */}
                  {details.grouped_actions && details.grouped_actions.length > 0 && (
                    <div className="space-y-2 border-t border-neutral-900 pt-3">
                      <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wide">
                        Grouped Actions Breakdown ({details.grouped_actions.length} individual items)
                      </span>
                      <div className="space-y-2">
                        {details.grouped_actions.map((act) => (
                          <div
                            key={act.action_id}
                            className="p-3 bg-neutral-900/70 border border-neutral-800 rounded flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="font-medium text-neutral-200">{act.description}</div>
                              <div className="text-neutral-500">
                                Provider: {act.provider || "N/A"} · ID: {act.action_id}
                              </div>
                            </div>
                            <div className="text-right">
                              {act.price !== undefined && (
                                <div className="font-mono text-neutral-100 font-medium">
                                  {details.currency || "USD"} {Number(act.price).toFixed(2)}
                                </div>
                              )}
                              <Badge tone={act.outcome === "succeeded" ? "positive" : "neutral"}>
                                {act.outcome || "PENDING"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decision Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-900">
                    <Button
                      variant="ghost"
                      disabled={submittingId === proposal.id || !isPending}
                      onClick={() => handleReject(proposal.id)}
                    >
                      Reject Action
                    </Button>
                    <Button
                      variant="primary"
                      disabled={submittingId === proposal.id || !isPending}
                      onClick={() => handleApprove(proposal)}
                    >
                      {submittingId === proposal.id ? "Validating with Core..." : "Approve Exact Action"}
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
