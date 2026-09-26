"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Select, TextArea } from "@/components/ui";
import { Callout } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import { useCreateReminder } from "../queries";
import {
  COMMON_TIMEZONES,
  INTERVAL_PRESETS,
  RECURRENCE_PRESETS,
  REMINDER_CHANNELS,
  REMINDER_MAX_RETRIES,
  SCHEDULE_KINDS,
  buildReminderInput,
  describeRecurrence,
  isScheduleKind,
  validateReminderDraft,
  type ReminderDraft,
} from "../schedule";

export const REMINDER_TITLE_FIELD_ID = "reminder-title";

export function ReminderForm({
  draft,
  onChange,
  onCreated,
}: {
  draft: ReminderDraft;
  onChange: (patch: Partial<ReminderDraft>) => void;
  onCreated: () => void;
}) {
  const create = useCreateReminder();
  const [validationError, setValidationError] = useState<string | null>(null);
  const timezoneOptions = COMMON_TIMEZONES.includes(
    draft.timezone as (typeof COMMON_TIMEZONES)[number],
  )
    ? COMMON_TIMEZONES
    : [draft.timezone, ...COMMON_TIMEZONES];

  function submit(event: FormEvent) {
    event.preventDefault();
    const problem = validateReminderDraft(draft);
    setValidationError(problem);
    if (problem) return;
    create.mutate(buildReminderInput(draft), { onSuccess: onCreated });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        id={REMINDER_TITLE_FIELD_ID}
        label="Reminder title"
        placeholder="e.g. Project status sync"
        value={draft.title}
        onChange={(event) => onChange({ title: event.target.value })}
        required
      />
      <TextArea
        id="reminder-message"
        label="Notification message"
        placeholder="What should Vox announce when this reminder triggers?"
        rows={3}
        value={draft.message}
        onChange={(event) => onChange({ message: event.target.value })}
        required
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <Select
          id="reminder-channel"
          label="Delivery channel"
          value={draft.channel}
          onChange={(event) => onChange({ channel: event.target.value })}
        >
          {REMINDER_CHANNELS.map((channel) => (
            <option key={channel.value} value={channel.value}>
              {channel.label}
            </option>
          ))}
        </Select>
        <Select
          id="reminder-timezone"
          label="Explicit timezone"
          value={draft.timezone}
          onChange={(event) => onChange({ timezone: event.target.value })}
        >
          {timezoneOptions.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </Select>
      </div>
      <Field
        id="reminder-destination"
        label="Destination (E.164 phone or account handle)"
        placeholder="+15551234567"
        value={draft.destination}
        onChange={(event) => onChange({ destination: event.target.value })}
        hint="Must be in E.164 format (+CountryCode…) for voice and WhatsApp."
        required
      />

      <fieldset className="space-y-4 rounded-lg border border-border-edge bg-obsidian/40 p-4">
        <legend className="px-1 text-xs font-medium text-smoke">
          Schedule
        </legend>
        <Select
          id="reminder-kind"
          label="Schedule kind"
          value={draft.scheduleKind}
          onChange={(event) => {
            if (isScheduleKind(event.target.value))
              onChange({ scheduleKind: event.target.value });
          }}
        >
          {SCHEDULE_KINDS.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </Select>
        {draft.scheduleKind === "one_time" ? (
          <Field
            id="reminder-run-at"
            label={`Run at (${draft.timezone})`}
            type="datetime-local"
            value={draft.runAt}
            onChange={(event) => onChange({ runAt: event.target.value })}
            required
          />
        ) : null}
        {draft.scheduleKind === "interval" ? (
          <Select
            id="reminder-interval"
            label="Interval period"
            value={draft.intervalSeconds}
            onChange={(event) =>
              onChange({ intervalSeconds: Number(event.target.value) })
            }
          >
            {INTERVAL_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </Select>
        ) : null}
        {draft.scheduleKind === "recurring" ? (
          <>
            <Select
              id="reminder-recurrence"
              label="Calendar schedule"
              value={draft.recurrencePreset}
              onChange={(event) =>
                onChange({ recurrencePreset: event.target.value })
              }
            >
              {RECURRENCE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </Select>
            {draft.recurrencePreset === "custom" ? (
              <Field
                id="reminder-custom-cron"
                label="Custom cron expression (e.g. 0 10 * * 1-5)"
                placeholder="0 9 * * *"
                value={draft.customCron}
                onChange={(event) =>
                  onChange({ customCron: event.target.value })
                }
                required
              />
            ) : null}
          </>
        ) : null}
      </fieldset>

      <Callout tone="info" title="Before you save">
        <ul className="space-y-1">
          <li>
            <strong>Timezone:</strong> Evaluated in {draft.timezone}.
          </li>
          <li>
            <strong>Recurrence:</strong> {describeRecurrence(draft)}.
          </li>
          <li>
            <strong>Channel &amp; retries:</strong> Dispatches via{" "}
            {draft.channel} to {draft.destination || "(unspecified)"}. Up to{" "}
            {REMINDER_MAX_RETRIES} delivery attempts within a 1-hour retry
            window.
          </li>
        </ul>
      </Callout>
      <Callout tone="warning" title="Non-action authority">
        <p>
          Reminders provide informational notification only and cannot execute
          transactions, authorize payments, or trigger external agent writes.
        </p>
      </Callout>

      <Button type="submit" disabled={create.isPending}>
        {create.isPending
          ? "Registering reminder with Core…"
          : "Schedule reminder"}
      </Button>
      {validationError ? (
        <Callout tone="danger" live="assertive">
          <p>{validationError}</p>
        </Callout>
      ) : null}
      {create.isError ? (
        <Callout
          tone="danger"
          title="Reminder was not created"
          live="assertive"
        >
          <p>{errorMessage(create.error, "Failed to create reminder")}</p>
        </Callout>
      ) : null}
      {create.isSuccess ? (
        <Callout tone="success" live="polite">
          <p>
            Reminder successfully created and registered with Core scheduler.
          </p>
        </Callout>
      ) : null}
    </form>
  );
}
