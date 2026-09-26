import { apiRequest } from "@/lib/api/http";
import type {
  LodgingBooking,
  LodgingBookingRequest,
  LodgingCancelResponse,
  LodgingSearchResponse,
  UberHistoryResponse,
} from "@/lib/consumer-auth/core-host-client";

export function readTripHistory(input: { connectionId: string }) {
  return apiRequest<UberHistoryResponse>(
    "/api/account/connection-actions/read",
    {
      method: "POST",
      body: { connection_id: input.connectionId, include_city: true },
      fallbackError: "Failed to read connected trip history",
    },
  );
}

export type LodgingSearch = {
  connectionId: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  occupancy: number;
};

export function searchLodging(search: LodgingSearch, signal?: AbortSignal) {
  return apiRequest<LodgingSearchResponse>(
    "/api/account/connection-actions/lodging",
    {
      query: { ...search },
      signal,
      fallbackError: "Lodging search failed",
    },
  );
}

export function bookLodging(input: LodgingBookingRequest) {
  return apiRequest<LodgingBooking>("/api/account/connection-actions/lodging", {
    method: "POST",
    body: input,
    fallbackError: "Booking failed",
  });
}

export function cancelLodging(input: {
  bookingId: string;
  connectionId: string;
  reason: string;
}) {
  return apiRequest<LodgingCancelResponse>(
    `/api/account/connection-actions/lodging/${encodeURIComponent(input.bookingId)}/cancel`,
    {
      method: "POST",
      body: { connection_id: input.connectionId, reason: input.reason },
      fallbackError: "Cancellation failed",
    },
  );
}
