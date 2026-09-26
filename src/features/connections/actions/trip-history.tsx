"use client";

import { Button } from "@/components/ui";
import {
  Callout,
  EmptyMessage,
  Labelled,
  ItemCard,
  StatusBadge,
  Tag,
} from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import {
  formatAuthoritativeDateTime,
  formatAuthoritativeDistance,
} from "@/lib/global-formatting";
import { useReadTripHistory } from "./queries";

export function TripHistory({ connectionId }: { connectionId: string }) {
  const read = useReadTripHistory();
  const history = read.data;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-smoke">
          Vox shows only the start city, time, distance, and status. Precise
          locations and rider tokens are removed before they reach you.
        </p>
        <Button
          size="sm"
          disabled={read.isPending}
          onClick={() => read.mutate({ connectionId })}
        >
          {read.isPending
            ? "Loading trips…"
            : history
              ? "Refresh trips"
              : "Load trip history"}
        </Button>
      </div>
      {read.isError ? (
        <Callout
          tone="danger"
          title="Trips could not be loaded"
          live="assertive"
        >
          <p>{errorMessage(read.error, "Read failed")}</p>
        </Callout>
      ) : null}
      {history ? (
        <>
          <div role="status" className="flex flex-wrap items-center gap-2">
            <Tag tone="positive">
              Total: {history.total_trips ?? history.trips.length}
            </Tag>
            <Tag>Freshness: {history.freshness_seconds ?? 300}s</Tag>
          </div>
          {history.trips.length === 0 ? (
            <EmptyMessage title="No trips returned" />
          ) : (
            <div className="grid gap-3 xl:grid-cols-2">
              {history.trips.map((trip) => {
                const distance = formatAuthoritativeDistance(
                  trip.distance_miles,
                  "mi",
                );
                const date = formatAuthoritativeDateTime(
                  trip.request_time,
                  "UTC",
                );
                return (
                  <ItemCard
                    key={trip.trip_id}
                    title={`Trip #${trip.trip_id}`}
                    badges={<StatusBadge status={trip.status} />}
                    subtitle={
                      <>
                        <Labelled label={date.ariaLabel}>
                          {date.formattedDateTime} ({date.authoritativeTimezone}
                          )
                        </Labelled>{" "}
                        · City: {trip.start_city || "Minimised"}
                      </>
                    }
                    actions={
                      <Tag label={distance.ariaLabel}>
                        {distance.authoritativeValue}
                      </Tag>
                    }
                  />
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
