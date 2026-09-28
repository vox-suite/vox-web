import { apiRequest } from "@/lib/api/http";
import type { UberHistoryResponse } from "@/lib/consumer-auth/core-host-client";

export function readTripHistory(input: {
  connectionId: string;
  includeCity: boolean;
}) {
  return apiRequest<UberHistoryResponse>(
    "/api/account/connection-actions/read",
    {
      method: "POST",
      body: {
        connection_id: input.connectionId,
        include_city: input.includeCity,
      },
      fallbackError: "Failed to read connected trip history",
    },
  );
}
