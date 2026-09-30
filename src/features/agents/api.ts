import { apiRequest } from "@/lib/api/http";
import type { SelectedAgent } from "@/lib/consumer-auth/core-host-client";
import type { AgentMutation } from "@/lib/consumer-auth/core-host-client";

export type Agent = SelectedAgent["definition"];

export async function manageAgent(mutation: AgentMutation): Promise<void> {
  await apiRequest("/api/account/agents", {
    method: "POST",
    body: mutation,
    fallbackError: "Unable to save agent",
  });
}

export async function listAgents(signal?: AbortSignal): Promise<Agent[]> {
  const { agents } = await apiRequest<{ agents: SelectedAgent[] }>(
    "/api/account/agents",
    { signal, fallbackError: "Unable to load agents" },
  );
  return agents.map((agent) => agent.definition);
}

export async function readAgentMemory(agentKey: string, signal?: AbortSignal) {
  return apiRequest<
    import("@/lib/consumer-auth/core-host-client").AgentMemoryView
  >(`/api/account/agents/${encodeURIComponent(agentKey)}/memory`, {
    signal,
    fallbackError: "Unable to read assistant memory",
  });
}
export async function changeAgentMemory(
  agentKey: string,
  change: Exclude<
    import("@/lib/consumer-auth/core-host-client").AgentMemoryChange,
    { operation: "read" }
  >,
) {
  return apiRequest<
    import("@/lib/consumer-auth/core-host-client").AgentMemoryView
  >(`/api/account/agents/${encodeURIComponent(agentKey)}/memory`, {
    method: "POST",
    body: change,
    fallbackError: "Unable to change assistant memory",
  });
}
