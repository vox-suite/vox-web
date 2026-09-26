import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { errorMessage } from "@/lib/api/http";
import { Callout } from "./callout";
import { ErrorState, ListSkeleton } from "./query-states";

/**
 * Renders the four states of a query consistently: skeleton while the first
 * load is pending, a retryable error when nothing is cached, the empty state,
 * or the data. A failed background refresh keeps showing cached data with a
 * warning instead of hiding it.
 */
export function QueryContent<T>({
  query,
  loadingLabel = "Loading",
  errorTitle = "This could not be loaded",
  skeletonRows,
  isEmpty,
  empty,
  children,
}: {
  query: UseQueryResult<T>;
  loadingLabel?: string;
  errorTitle?: string;
  skeletonRows?: number;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (query.isPending)
    return <ListSkeleton rows={skeletonRows} label={loadingLabel} />;
  if (query.data === undefined) {
    return (
      <ErrorState
        error={query.error}
        title={errorTitle}
        onRetry={() => void query.refetch()}
        retrying={query.isRefetching}
      />
    );
  }
  return (
    <>
      {query.isError ? (
        <Callout
          tone="warning"
          title="Showing the last loaded data"
          live="polite"
        >
          <p>{errorMessage(query.error)}</p>
        </Callout>
      ) : null}
      {isEmpty?.(query.data) ? empty : children(query.data)}
    </>
  );
}
