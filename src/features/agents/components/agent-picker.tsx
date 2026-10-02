"use client";

import { Button } from "@/components/ui";
import { ErrorState } from "@/components/app";
import { Skeleton } from "@/components/ui";
import { useAgents } from "../queries";
import { AgentManager } from "./agent-manager";

/**
 * Returns the agent the user picked, falling back to the explicit default assistant
 * once the list loads (derived, so no effect is needed to "initialise" it).
 */
export function resolveAgentKey(
  picked: string | null,
  agents:
    ReadonlyArray<{ external_key: string; is_default: boolean }> | undefined,
) {
  return (
    agents?.find((agent) => agent.external_key === picked)?.external_key ??
    agents?.find((agent) => agent.is_default)?.external_key ??
    ""
  );
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
          Your assistant is unavailable. Try reloading.
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
            {agent.display_name}
            {agent.is_default ? " · Default" : ""}
          </Button>
        ))
      )}
      <AgentManager agents={agents.data} />
    </div>
  );
}
