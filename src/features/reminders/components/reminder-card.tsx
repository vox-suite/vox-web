"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Callout, ItemCard, Labelled, StatusBadge } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import type { Reminder } from "@/lib/consumer-auth/core-host-client";
import { formatAuthoritativeDateTime } from "@/lib/global-formatting";
import { useCancelReminder } from "../queries";
import { reminderDisplayStatus, reminderDueAt } from "../schedule";
import { DeliveryReceipts } from "./delivery-receipts";

function DueTime({ reminder }: { reminder: Reminder }) {
  const target = reminderDueAt(reminder);
  if (!target) return <strong>(unspecified time)</strong>;
  const due = formatAuthoritativeDateTime(target, reminder.timezone);
  return (
    <strong>
      <Labelled label={due.ariaLabel}>
        {due.formattedDateTime} ({due.authoritativeTimezone})
      </Labelled>
    </strong>
  );
}

export function ReminderCard({
  reminder,
  now,
  onReschedule,
}: {
  reminder: Reminder;
  now: number;
  onReschedule: (
    reminder: Reminder,
    options: { keepTimezone: boolean },
  ) => void;
}) {
  const [showReceipts, setShowReceipts] = useState(false);
  const cancel = useCancelReminder();
  const status = reminderDisplayStatus(reminder, now);
  const missed = status === "missed";

  return (
    <ItemCard
      testId={`reminder-${reminder.id}`}
      title={reminder.title}
      subtitle={reminder.message}
      badges={<StatusBadge status={status} />}
      actions={
        <>
          {reminder.status === "scheduled" && !missed ? (
            <Button
              variant="danger"
              size="sm"
              aria-label={`Cancel reminder: ${reminder.title}`}
              disabled={cancel.isPending}
              onClick={() => cancel.mutate(reminder.id)}
            >
              {cancel.isPending ? "Cancelling…" : "Cancel"}
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            aria-expanded={showReceipts}
            aria-label={`${showReceipts ? "Hide receipts" : "Show delivery history"} for ${reminder.title}`}
            onClick={() => setShowReceipts((open) => !open)}
          >
            {showReceipts ? "Hide receipts" : "Delivery history"}
          </Button>
        </>
      }
      footer={
        <>
          <span className="min-w-0 break-words">
            {reminder.timezone} · {reminder.schedule_kind} · {reminder.channel}{" "}
            → {reminder.destination}
          </span>
          <span>
            Attempts: {reminder.retry_count} / {reminder.max_retries}
          </span>
        </>
      }
    >
      {missed ? (
        <Callout
          tone="warning"
          title="Missed reminder"
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReschedule(reminder, { keepTimezone: false })}
            >
              Reschedule as new reminder
            </Button>
          }
        >
          <p>
            This reminder was scheduled for <DueTime reminder={reminder} />, but
            the delivery window elapsed during system or provider
            unavailability. Missed reminders are surfaced for review rather than
            silently delivered late.
          </p>
        </Callout>
      ) : null}
      {reminder.status === "failed" ? (
        <Callout
          tone="danger"
          title="Delivery failed"
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReschedule(reminder, { keepTimezone: true })}
            >
              Edit &amp; retry
            </Button>
          }
        >
          <p>
            Provider rejected delivery to {reminder.destination}. Inspect
            provider receipts or re-configure the destination.
          </p>
        </Callout>
      ) : null}
      {reminder.status === "delivered_to_channel" ? (
        <Callout tone="success">
          <p>
            Notification accepted by {reminder.channel} carrier at{" "}
            {reminder.last_attempt_at || "scheduled time"}. Delivered to carrier
            does not guarantee the recipient has viewed the message.
          </p>
        </Callout>
      ) : null}
      {cancel.isError ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(cancel.error, "Failed to cancel reminder")}</p>
        </Callout>
      ) : null}
      {cancel.isSuccess ? (
        <Callout tone="success" live="polite">
          <p>Reminder cancelled. Scheduled runs halted.</p>
        </Callout>
      ) : null}
      {showReceipts ? <DeliveryReceipts reminderId={reminder.id} /> : null}
    </ItemCard>
  );
}
