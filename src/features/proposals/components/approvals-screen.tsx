"use client";

import { useState } from "react";
import { Callout, EmptyMessage, PageHeader, Panel } from "@/components/app";
import { useNow } from "@/hooks/use-now";
import { errorMessage } from "@/lib/api/http";
import type { ActionProposal } from "@/lib/consumer-auth/core-host-client";
import { proposalStatus } from "../api";
import { useApproveProposal, useRejectProposal } from "../queries";
import { ProposalCard } from "./proposal-card";

/**
 * Core does not yet expose a proposal listing to hosts, so proposals arrive
 * through `initialProposals`. Decisions are always validated by Core.
 */
export function ApprovalsScreen({
  initialProposals = [],
}: {
  initialProposals?: ActionProposal[];
}) {
  const [proposals, setProposals] = useState(initialProposals);
  const [notice, setNotice] = useState<string | null>(null);
  const now = useNow();
  const approve = useApproveProposal();
  const reject = useRejectProposal();
  const submittingId = approve.isPending
    ? approve.variables?.id
    : reject.isPending
      ? reject.variables
      : undefined;
  const failure = approve.error ?? reject.error;

  function update(id: string, patch: Partial<ActionProposal>) {
    setProposals((current) =>
      current.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exact action proposals & approvals"
        description="Inspect material details before executing consequential actions. Client flags are never trusted; Core verifies exact signed details."
      />
      <Callout title="Exact-match binding">
        <p>
          Approvals require an exact, byte-for-byte match with the proposal hash
          stored in Core. If details, pricing, recipients, or timing change,
          existing proposals are invalidated and require a new decision.
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
                status={proposalStatus(proposal, now)}
                submitting={submittingId === proposal.id}
                onApprove={() => {
                  setNotice(null);
                  reject.reset();
                  approve.mutate(proposal, {
                    onSuccess: (approved) => {
                      update(proposal.id, {
                        state: "approved",
                        approval_id: approved.approval_id,
                      });
                      setNotice(
                        `Proposal ${proposal.id} successfully approved and bound.`,
                      );
                    },
                  });
                }}
                onReject={() => {
                  setNotice(null);
                  approve.reset();
                  reject.mutate(proposal.id, {
                    onSuccess: () => {
                      update(proposal.id, { state: "superseded" });
                      setNotice(
                        `Proposal ${proposal.id} rejected. The agent will not execute this action.`,
                      );
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
