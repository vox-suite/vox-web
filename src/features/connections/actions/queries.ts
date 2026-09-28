import { useMutation } from "@tanstack/react-query";
import { readTripHistory } from "./api";

/** Trip history is a user-initiated connected read (POST), not a cached background query. */
export function useReadTripHistory() {
  return useMutation({ mutationFn: readTripHistory });
}
