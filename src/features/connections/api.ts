import { apiRequest } from "@/lib/api/http";
import type { Connection } from "@/lib/consumer-auth/core-host-client";

export async function listConnections(signal?: AbortSignal) {
  const { connections } = await apiRequest<{ connections: Connection[] }>(
    "/api/account/connections",
    { signal, fallbackError: "Failed to load connections" },
  );
  return connections;
}

export function disconnectConnection(connectionId: string) {
  return apiRequest<{ connection: Connection; disclosure: string }>(
    `/api/account/connections/${encodeURIComponent(connectionId)}/disconnect`,
    { method: "POST", fallbackError: "Failed to disconnect" },
  );
}
