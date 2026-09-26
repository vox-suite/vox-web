"use client";

import { ErrorState, ListSkeleton, StatusBadge } from "@/components/app";
import { useReminderDeliveries } from "../queries";

export function DeliveryReceipts({ reminderId }: { reminderId: string }) {
  const { data, error, isPending, refetch, isRefetching } =
    useReminderDeliveries(reminderId, true);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-mist">
        Provider delivery receipts
      </p>
      {isPending ? (
        <ListSkeleton rows={1} label="Loading delivery logs" />
      ) : error ? (
        <ErrorState
          error={error}
          title="Delivery receipts could not be loaded"
          onRetry={() => void refetch()}
          retrying={isRefetching}
        />
      ) : data.length === 0 ? (
        <p className="text-xs text-smoke">
          No external provider dispatch attempts recorded yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.map((delivery) => (
            <li
              key={delivery.id}
              className="flex flex-col gap-2 rounded-md border border-border-edge bg-ink p-3 text-xs sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="break-words font-medium text-mist">
                  {delivery.channel.toUpperCase()} dispatch to{" "}
                  {delivery.destination}
                </p>
                <p className="text-smoke">
                  Attempted at:{" "}
                  {new Date(delivery.attempted_at).toLocaleString()}
                </p>
                {delivery.failure_reason ? (
                  <p className="text-coral-pulse">
                    Error: {delivery.failure_reason}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <StatusBadge status={delivery.status} />
                {delivery.provider_receipt_id ? (
                  <span className="break-all font-mono text-[11px] text-smoke">
                    Receipt: {delivery.provider_receipt_id}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
