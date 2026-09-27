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

export type ConnectPlayStationInput = {
  accountDisplayId: string;
  npssoToken?: string;
};

export function connectPlayStation(input: ConnectPlayStationInput) {
  return apiRequest<{
    connection: Connection;
    synced_spans_count: number;
    message: string;
  }>("/api/account/connections/playstation", {
    method: "POST",
    body: JSON.stringify({
      account_display_id: input.accountDisplayId,
      npsso_token: input.npssoToken,
    }),
    fallbackError: "Failed to connect PlayStation account",
  });
}
