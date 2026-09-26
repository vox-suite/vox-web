import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  bookLodging,
  cancelLodging,
  readTripHistory,
  searchLodging,
  type LodgingSearch,
} from "./api";

export const actionKeys = {
  all: ["connection-actions"] as const,
  lodgingSearch: (search: LodgingSearch) =>
    [...actionKeys.all, "lodging", search] as const,
};

/** Runs only once the user submits a search; switching back to a previous destination is served from cache. */
export function useLodgingSearch(search: LodgingSearch | null) {
  return useQuery({
    queryKey: search ? actionKeys.lodgingSearch(search) : actionKeys.all,
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
