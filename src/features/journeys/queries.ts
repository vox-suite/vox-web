import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  bookLodging,
  cancelLodging,
  createHandoff,
  readTripHistory,
  searchLodging,
  type LodgingSearch,
} from "./api";

export const journeyKeys = {
  all: ["journeys"] as const,
  lodgingSearch: (search: LodgingSearch) =>
    [...journeyKeys.all, "lodging", search] as const,
};

/** Runs only once the user submits a search; switching back to a previous destination is served from cache. */
export function useLodgingSearch(search: LodgingSearch | null) {
  return useQuery({
    queryKey: search ? journeyKeys.lodgingSearch(search) : journeyKeys.all,
    queryFn: search ? ({ signal }) => searchLodging(search, signal) : skipToken,
    placeholderData: keepPreviousData,
  });
}

/** Trip history is a user-initiated connected read (POST), not a cached background query. */
export function useReadTripHistory() {
  return useMutation({ mutationFn: readTripHistory });
}

export function useBookLodging() {
  return useMutation({ mutationFn: bookLodging });
}

export function useCancelLodging() {
  return useMutation({ mutationFn: cancelLodging });
}

export function useCreateHandoff() {
  return useMutation({ mutationFn: createHandoff });
}
