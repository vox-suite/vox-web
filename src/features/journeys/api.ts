import { apiRequest } from "@/lib/api/http";
import type {
  AmazonHandoffRequest,
  HandoffResponse,
  LodgingBooking,
  LodgingBookingRequest,
  LodgingCancelResponse,
  LodgingSearchResponse,
  UberHandoffRequest,
  UberHistoryResponse,
  ZomatoHandoffRequest,
} from "@/lib/consumer-auth/core-host-client";

export function readTripHistory(input: { connectionId: string }) {
  return apiRequest<UberHistoryResponse>("/api/account/journeys/read", {
    method: "POST",
    body: { connection_id: input.connectionId, include_city: true },
    fallbackError: "Failed to read connected trip history",
  });
}

export type LodgingSearch = {
  connectionId: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  occupancy: number;
};

export function searchLodging(search: LodgingSearch, signal?: AbortSignal) {
  return apiRequest<LodgingSearchResponse>("/api/account/journeys/lodging", {
    query: { ...search },
    signal,
    fallbackError: "Lodging search failed",
  });
}

export function bookLodging(input: LodgingBookingRequest) {
  return apiRequest<LodgingBooking>("/api/account/journeys/lodging", {
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
    `/api/account/journeys/lodging/${encodeURIComponent(input.bookingId)}/cancel`,
    {
      method: "POST",
      body: { connection_id: input.connectionId, reason: input.reason },
      fallbackError: "Cancellation failed",
    },
  );
}

export type HandoffInput =
  | { provider: "amazon"; handoff: AmazonHandoffRequest }
  | { provider: "zomato"; handoff: ZomatoHandoffRequest }
  | { provider: "uber"; handoff: UberHandoffRequest };

export type HandoffProvider = HandoffInput["provider"];

export function createHandoff(input: HandoffInput & { connectionId: string }) {
  return apiRequest<HandoffResponse>("/api/account/journeys/handoffs", {
    method: "POST",
    body: {
      provider: input.provider,
      connection_id: input.connectionId,
      handoff: input.handoff,
    },
    fallbackError: "Handoff generation failed",
  });
}
