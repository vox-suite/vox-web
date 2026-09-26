import { apiRequest } from "@/lib/api/http";
import type { SelectedAgent } from "@/lib/consumer-auth/core-host-client";

export type Agent = SelectedAgent["definition"];

export async function listAgents(signal?: AbortSignal): Promise<Agent[]> {
  const { agents } = await apiRequest<{ agents: SelectedAgent[] }>(
    "/api/account/agents",
    { signal, fallbackError: "Unable to load agents" },
  );
  return agents.map((agent) => agent.definition);
}
