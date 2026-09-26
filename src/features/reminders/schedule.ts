import type {
  CreateReminderInput,
  Reminder,
  ReminderScheduleKind,
} from "@/lib/consumer-auth/core-host-client";

export const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Australia/Sydney",
] as const;

export const RECURRENCE_PRESETS = [
  { label: "Every day at 9:00 AM", value: "0 9 * * *" },
  { label: "Every weekday at 9:00 AM (Mon-Fri)", value: "0 9 * * 1-5" },
  { label: "Every Monday at 9:00 AM", value: "0 9 * * 1" },
  { label: "Every day at 6:00 PM", value: "0 18 * * *" },
  { label: "Custom Cron Expression", value: "custom" },
] as const;

export const INTERVAL_PRESETS = [
  { label: "Every 15 minutes", value: 900 },
  { label: "Every 30 minutes", value: 1800 },
  { label: "Every 1 hour", value: 3600 },
  { label: "Every 2 hours", value: 7200 },
  { label: "Every 6 hours", value: 21600 },
  { label: "Every 24 hours", value: 86400 },
] as const;

export const REMINDER_CHANNELS = [
  { value: "whatsapp", label: "WhatsApp Message" },
  { value: "voice", label: "Voice Phone Call" },
  { value: "browser_push", label: "Reference Web Push" },
] as const;

export const SCHEDULE_KINDS: ReadonlyArray<{
  value: ReminderScheduleKind;
  label: string;
}> = [
  { value: "one_time", label: "One-time" },
  { value: "interval", label: "Interval (Fixed Frequency)" },
  { value: "recurring", label: "Recurring (Calendar Cron)" },
];

export const REMINDER_MAX_RETRIES = 3;
/** A scheduled reminder still undelivered this long after its due time is surfaced as missed. */
const MISSED_AFTER_MS = 60 * 60 * 1000;

export type ReminderDraft = {
  title: string;
  message: string;
  channel: string;
  destination: string;
  timezone: string;
  scheduleKind: ReminderScheduleKind;
  /** `datetime-local` input value. */
  runAt: string;
  intervalSeconds: number;
  recurrencePreset: string;
  customCron: string;
};

export function emptyReminderDraft(timezone: string): ReminderDraft {
  return {
    title: "",
    message: "",
    channel: "whatsapp",
    destination: "",
    timezone,
    scheduleKind: "one_time",
    runAt: "",
    intervalSeconds: 3600,
    recurrencePreset: "0 9 * * *",
    customCron: "",
  };
}

export function isScheduleKind(value: string): value is ReminderScheduleKind {
  return SCHEDULE_KINDS.some((kind) => kind.value === value);
}

export function validateReminderDraft(draft: ReminderDraft): string | null {
  if (!draft.title.trim() || !draft.message.trim() || !draft.destination.trim())
    return "Title, message, and destination are required.";
  return null;
}

export function buildReminderInput(draft: ReminderDraft): CreateReminderInput {
  const recurrence =
    draft.scheduleKind === "recurring"
      ? draft.recurrencePreset === "custom"
        ? draft.customCron.trim()
        : draft.recurrencePreset
      : null;
  return {
    title: draft.title.trim(),
    message: draft.message.trim(),
    channel: draft.channel,
    destination: draft.destination.trim(),
    timezone: draft.timezone,
    schedule_kind: draft.scheduleKind,
    run_at:
      draft.scheduleKind === "one_time" && draft.runAt
        ? new Date(draft.runAt).toISOString()
        : null,
    interval_seconds:
      draft.scheduleKind === "interval" ? Number(draft.intervalSeconds) : null,
    recurrence_expression: recurrence,
    max_retries: REMINDER_MAX_RETRIES,
  };
}

export function describeRecurrence(draft: ReminderDraft): string {
  switch (draft.scheduleKind) {
    case "one_time":
      return draft.runAt
        ? `One-time on ${new Date(draft.runAt).toLocaleString()}`
        : "One-time (upon due time)";
    case "interval": {
      const match = INTERVAL_PRESETS.find(
        (preset) => preset.value === Number(draft.intervalSeconds),
      );
      return match ? match.label : `Every ${draft.intervalSeconds} seconds`;
    }
    case "recurring": {
      if (draft.recurrencePreset === "custom")
        return `Custom cron: ${draft.customCron || "None specified"}`;
      const match = RECURRENCE_PRESETS.find(
        (preset) => preset.value === draft.recurrencePreset,
      );
      return match ? match.label : draft.recurrencePreset;
    }
  }
}

export function reminderDueAt(reminder: Reminder) {
  return reminder.next_run_at || reminder.run_at;
}

export function isReminderMissed(reminder: Reminder, now: number): boolean {
  if (reminder.status !== "scheduled") return false;
  const target = reminderDueAt(reminder);
  if (!target) return false;
  return now - new Date(target).getTime() > MISSED_AFTER_MS;
}

/** The status shown to the user: a stale scheduled reminder is reported as missed, never as pending. */
export function reminderDisplayStatus(reminder: Reminder, now: number) {
  return isReminderMissed(reminder, now) ? "missed" : reminder.status;
}

/** Prefill a new draft from an existing reminder (reschedule / retry flows). */
export function draftFromReminder(
  reminder: Reminder,
  base: ReminderDraft,
  { keepTimezone }: { keepTimezone: boolean },
): ReminderDraft {
  return {
    ...base,
    title: reminder.title,
    message: reminder.message,
    channel: reminder.channel,
    destination: reminder.destination,
    timezone: keepTimezone ? base.timezone : reminder.timezone,
  };
}
