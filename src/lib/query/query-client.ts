import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/http";

/** Account data changes through user actions or agents; 30 s keeps navigation instant without hiding agent-driven changes for long. */
export const DEFAULT_STALE_TIME = 30_000;
const DEFAULT_GC_TIME = 5 * 60_000;
const MAX_RETRIES = 2;

export function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.isClientError) return false;
  return failureCount < MAX_RETRIES;
}

export function makeQueryClient({
  onUnauthorized,
}: { onUnauthorized?: () => void } = {}) {
  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.isUnauthorized) onUnauthorized?.();
  };
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME,
        gcTime: DEFAULT_GC_TIME,
        retry: shouldRetry,
        refetchOnWindowFocus: true,
      },
      mutations: { retry: false },
    },
  });
}
