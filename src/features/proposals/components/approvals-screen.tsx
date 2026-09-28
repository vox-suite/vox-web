"use client";

import { useState } from "react";
import { Callout, EmptyMessage, PageHeader, Panel } from "@/components/app";
import { useNow } from "@/hooks/use-now";
import { errorMessage } from "@/lib/api/http";
import { proposalStatus } from "../api";
import {
  useApproveProposal,
  useRejectProposal,
  useProposals,
  useExecuteProposal,
} from "../queries";
import { ProposalCard } from "./proposal-card";

export function ApprovalsScreen() {
  const listing = useProposals();
  const proposals = listing.data ?? [];
  const [attempts, setAttempts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const now = useNow();
  const approve = useApproveProposal();
  const reject = useRejectProposal();
  const execute = useExecuteProposal();
  const submittingId = approve.isPending
    ? approve.variables?.id
    : reject.isPending
      ? reject.variables
      : undefined;
  const failure =
    approve.error ?? reject.error ?? execute.error ?? listing.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exact action proposals & approvals"
        description="Inspect material details before executing consequential actions. Client flags are never trusted; Core verifies exact signed details."
      />
      <Callout title="Exact-match binding">
        <p>
          Core checks the exact reviewed proposal details under your
          authenticated session. If details, pricing, recipients, or timing
          change, existing proposals are invalidated and require a new decision.
        </p>
      </Callout>
      {failure ? (
        <Callout tone="danger" title="Decision error" live="assertive">
          <p>{errorMessage(failure, "The decision could not be recorded")}</p>
        </Callout>
      ) : notice ? (
        <Callout tone="success" title="Decision recorded" live="polite">
          <p>{notice}</p>
        </Callout>
      ) : null}
      <Panel title="Pending decisions">
        {listing.isPending ? <p role="status">Loading proposals…</p> : null}
        {proposals.length === 0 ? (
          <EmptyMessage title="Nothing needs your decision">
            No pending action proposals require your decision. When an agent
            proposes a consequential action, its exact details appear here for
            approval.
          </EmptyMessage>
        ) : (
          <div className="space-y-3">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                status={
                  proposal.approval_id
                    ? "approved"
                    : proposalStatus(proposal, now)
                }
                submitting={submittingId === proposal.id}
                onApprove={() => {
                  setNotice(null);
                  reject.reset();
                  approve.mutate(proposal, {
                    onSuccess: async () => {
                      await listing.refetch();
                      setNotice(
                        "Approval recorded. The action has not executed yet.",
                      );
                    },
                  });
                }}
                onExecute={() => {
                  if (!proposal.approval_id) return;
                  const idempotencyKey =
                    attempts[proposal.id] ?? crypto.randomUUID();
                  setAttempts((current) => ({
                    ...current,
                    [proposal.id]: idempotencyKey,
                  }));
                  execute.mutate(
                    { proposal, idempotencyKey },
                    {
                      onSuccess: async (result) => {
                        await listing.refetch();
                        setNotice(
                          result.state === "confirmed"
                            ? "Provider outcome confirmed."
                            : "Action dispatched. Outcome needs independent confirmation or reconciliation.",
                        );
                      },
                    },
                  );
                }}
                onReject={() => {
                  setNotice(null);
                  approve.reset();
                  reject.mutate(proposal.id, {
                    onSuccess: async () => {
                      await listing.refetch();
                      setNotice("Proposal rejected in Core.");
                    },
                  });
                }}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
