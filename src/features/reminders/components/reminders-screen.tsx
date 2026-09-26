"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui";
import {
  EmptyMessage,
  PageHeader,
  Panel,
  QueryContent,
} from "@/components/app";
import { useBrowserTimeZone } from "@/hooks/use-browser-time-zone";
import { useNow } from "@/hooks/use-now";
import type { Reminder } from "@/lib/consumer-auth/core-host-client";
import { useReminders } from "../queries";
import {
  draftFromReminder,
  emptyReminderDraft,
  type ReminderDraft,
} from "../schedule";
import { REMINDER_TITLE_FIELD_ID, ReminderForm } from "./reminder-form";
import { ReminderCard } from "./reminder-card";

export function RemindersScreen() {
  const reminders = useReminders();
  const now = useNow();
  const browserTimeZone = useBrowserTimeZone();
  // `timezone: ""` means "not chosen yet": follow the browser's zone.
  const [draftState, setDraft] = useState<ReminderDraft>(() =>
    emptyReminderDraft(""),
  );
  const draft = {
    ...draftState,
    timezone: draftState.timezone || browserTimeZone,
  };

  function updateDraft(patch: Partial<ReminderDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function reschedule(reminder: Reminder, options: { keepTimezone: boolean }) {
    setDraft(draftFromReminder(reminder, draft, options));
    const title = document.getElementById(REMINDER_TITLE_FIELD_ID);
    title?.scrollIntoView({ behavior: "smooth", block: "center" });
    title?.focus({ preventScroll: true });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminders & delivery status"
        description="Schedule explicit-timezone reminders with verifiable channel receipts. Core enforces strict non-action authority."
        actions={
          <Button
            variant="secondary"
            size="sm"
            disabled={reminders.isFetching}
            onClick={() => void reminders.refetch()}
          >
            <RotateCw
              aria-hidden="true"
              className={reminders.isFetching ? "animate-spin" : undefined}
            />
            {reminders.isFetching ? "Refreshing…" : "Refresh status"}
          </Button>
        }
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <Panel title="New reminder" className="xl:order-2">
          <ReminderForm
            draft={draft}
            onChange={updateDraft}
            onCreated={() =>
              setDraft((current) => ({
                ...current,
                title: "",
                message: "",
                runAt: "",
              }))
            }
          />
        </Panel>
        <Panel
          title={`Registered reminders${reminders.data ? ` (${reminders.data.length})` : ""}`}
          className="xl:order-1"
        >
          <QueryContent
            query={reminders}
            loadingLabel="Loading reminders"
            errorTitle="Reminders could not be loaded"
            isEmpty={(data) => data.length === 0}
            empty={
              <EmptyMessage title="No reminders yet">
                Use the schedule form to create your first reminder.
              </EmptyMessage>
            }
          >
            {(data) => (
              <div className="space-y-3">
                {data.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    now={now}
                    onReschedule={reschedule}
                  />
                ))}
              </div>
            )}
          </QueryContent>
        </Panel>
      </div>
    </div>
  );
}
