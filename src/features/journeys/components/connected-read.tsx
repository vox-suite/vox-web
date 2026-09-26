"use client";

import { Button } from "@/components/ui";
import {
  Callout,
  EmptyMessage,
  Labelled,
  ItemCard,
  Panel,
  StatusBadge,
  Tag,
} from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import {
  formatAuthoritativeDateTime,
  formatAuthoritativeDistance,
} from "@/lib/global-formatting";
import { useReadTripHistory } from "../queries";

export function ConnectedRead({ connectionId }: { connectionId: string }) {
  const read = useReadTripHistory();
  const history = read.data;

  return (
    <Panel
      title="Selected connected read: Uber trip history (L2)"
      description="Demonstrates context minimization: rider credentials and precise coordinates are stripped at the Core boundary."
      actions={
        <Button
          size="sm"
          disabled={read.isPending}
          aria-label="Retrieve trip history with context minimization"
          onClick={() => read.mutate({ connectionId })}
        >
          {read.isPending
            ? "Reading authoritative trips…"
            : "Retrieve trip history (L2)"}
        </Button>
      }
    >
      <Callout title="Data minimization guarantee">
        <p>
          Location coordinates and internal rider tokens are redacted. Vox only
          displays start city, timestamp, distance, and status.
        </p>
      </Callout>
      {read.isError ? (
        <Callout tone="danger" title="Journey notice" live="assertive">
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
            <span className="text-xs text-smoke">
              Authoritative trip history retrieved with location minimization.
            </span>
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
      ) : (
        <EmptyMessage title="No trip history loaded">
          Retrieve trip history to inspect authoritative read data.
        </EmptyMessage>
      )}
    </Panel>
  );
}
