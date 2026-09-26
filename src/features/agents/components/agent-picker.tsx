"use client";

import { Button } from "@/components/ui";
import { ErrorState } from "@/components/app";
import { Skeleton } from "@/components/ui";
import { useAgents } from "../queries";

/**
 * Returns the agent the user picked, falling back to the first selected agent
 * once the list loads (derived, so no effect is needed to "initialise" it).
 */
export function resolveAgentKey(
  picked: string | null,
  agents: ReadonlyArray<{ external_key: string }> | undefined,
) {
  return picked ?? agents?.[0]?.external_key ?? "";
}

export function AgentPicker({
  value,
  onChange,
  label = "Choose an agent",
}: {
  value: string;
  onChange: (agentKey: string) => void;
  label?: string;
}) {
  const agents = useAgents();

  if (agents.isPending)
    return (
      <div role="status" aria-label="Loading agents">
        <Skeleton className="h-8 w-56 bg-graphite" />
      </div>
    );
  if (!agents.data)
    return (
      <ErrorState
        error={agents.error}
        title="Agents could not be loaded"
        onRetry={() => void agents.refetch()}
        retrying={agents.isRefetching}
      />
    );

  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-[13px] text-smoke">{label}:</span>
      {agents.data.length === 0 ? (
        <span className="text-[13px] text-smoke">
          No agents selected for this deployment.
        </span>
      ) : (
        agents.data.map((agent) => (
          <Button
            key={agent.external_key}
            size="sm"
            variant={value === agent.external_key ? "primary" : "secondary"}
            aria-pressed={value === agent.external_key}
            title={agent.purpose}
            onClick={() => onChange(agent.external_key)}
          >
            {agent.external_key}
          </Button>
        ))
      )}
    </div>
  );
}
