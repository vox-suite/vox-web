"use client";

import { useEffect, useState, useId } from "react";
import {
  Badge,
  Button,
  Card,
  Field,
  Notice,
  Row,
  Select,
  Stack,
  Text,
  TextArea,
} from "@/components/ui";
import type {
  Reminder,
  ReminderDelivery,
  ReminderScheduleKind,
} from "@/lib/consumer-auth/core-host-client";
import {
  formatAuthoritativeDateTime,
  getAccessibleStatusIndicator,
} from "@/lib/global-formatting";

const COMMON_TIMEZONES = [
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
];

const RECURRENCE_PRESETS = [
  { label: "Every day at 9:00 AM", value: "0 9 * * *" },
  { label: "Every weekday at 9:00 AM (Mon-Fri)", value: "0 9 * * 1-5" },
  { label: "Every Monday at 9:00 AM", value: "0 9 * * 1" },
  { label: "Every day at 6:00 PM", value: "0 18 * * *" },
  { label: "Custom Cron Expression", value: "custom" },
];

const INTERVAL_PRESETS = [
  { label: "Every 15 minutes", value: 900 },
  { label: "Every 30 minutes", value: 1800 },
  { label: "Every 1 hour", value: 3600 },
  { label: "Every 2 hours", value: 7200 },
  { label: "Every 6 hours", value: 21600 },
  { label: "Every 24 hours", value: 86400 },
];

export function RemindersManager() {
  const formId = useId();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [destination, setDestination] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [scheduleKind, setScheduleKind] =
    useState<ReminderScheduleKind>("one_time");
  const [runAt, setRunAt] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(3600);
  const [recurrencePreset, setRecurrencePreset] = useState("0 9 * * *");
  const [customCron, setCustomCron] = useState("");
  const maxRetries = 3;

  // Deliveries inspection
  const [expandedReminderId, setExpandedReminderId] = useState<string | null>(
    null,
  );
  const [deliveries, setDeliveries] = useState<
    Record<string, ReminderDelivery[]>
  >({});
  const [loadingDeliveries, setLoadingDeliveries] = useState<
    Record<string, boolean>
  >({});

  // Detect user's local timezone on mount
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        queueMicrotask(() => setTimezone(detected));
      }
    } catch {
      // UTC remains the explicit fallback.
    }
    void loadReminders();
  }, []);

  async function loadReminders() {
    try {
      const res = await fetch("/api/account/reminders");
      if (!res.ok) throw new Error("Failed to load reminders from Core");
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !destination.trim()) {
      setError("Title, message, and destination are required.");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      setSuccess(null);

      const recurrenceExpression =
        scheduleKind === "recurring"
          ? recurrencePreset === "custom"
            ? customCron.trim()
            : recurrencePreset
          : null;

      const payload = {
        title: title.trim(),
        message: message.trim(),
        channel,
        destination: destination.trim(),
        timezone,
        schedule_kind: scheduleKind,
        run_at:
          scheduleKind === "one_time" && runAt
            ? new Date(runAt).toISOString()
            : null,
        interval_seconds:
          scheduleKind === "interval" ? Number(intervalSeconds) : null,
        recurrence_expression: recurrenceExpression,
        max_retries: Number(maxRetries),
      };

      const res = await fetch("/api/account/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create reminder");
      }

      setReminders((prev) => [data.reminder, ...prev]);
      setSuccess(
        "Reminder successfully created and registered with Core scheduler.",
      );
      setTitle("");
      setMessage("");
      setRunAt("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create reminder",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleCancel(reminderId: string) {
    try {
      setError(null);
      const res = await fetch(
        `/api/account/reminders/${encodeURIComponent(reminderId)}/cancel`,
        {
          method: "POST",
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel reminder");
      }
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? data.reminder : r)),
      );
      setSuccess("Reminder cancelled. Scheduled runs halted.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel reminder",
      );
    }
  }

  async function toggleDeliveries(reminderId: string) {
    if (expandedReminderId === reminderId) {
      setExpandedReminderId(null);
      return;
    }
    setExpandedReminderId(reminderId);
    if (!deliveries[reminderId]) {
      try {
        setLoadingDeliveries((prev) => ({ ...prev, [reminderId]: true }));
        const res = await fetch(
          `/api/account/reminders/${encodeURIComponent(reminderId)}/deliveries`,
        );
        if (res.ok) {
          const data = await res.json();
          setDeliveries((prev) => ({
            ...prev,
            [reminderId]: data.deliveries || [],
          }));
        }
      } catch {
        // Silently preserve empty
      } finally {
        setLoadingDeliveries((prev) => ({ ...prev, [reminderId]: false }));
      }
    }
  }

  function getRecurrenceLabel(): string {
    if (scheduleKind === "one_time") {
      return runAt
        ? `One-time on ${new Date(runAt).toLocaleString()}`
        : "One-time (upon due time)";
    }
    if (scheduleKind === "interval") {
      const match = INTERVAL_PRESETS.find(
        (p) => p.value === Number(intervalSeconds),
      );
      return match ? match.label : `Every ${intervalSeconds} seconds`;
    }
    if (scheduleKind === "recurring") {
      if (recurrencePreset === "custom") {
        return `Custom cron: ${customCron || "None specified"}`;
      }
      const match = RECURRENCE_PRESETS.find(
        (p) => p.value === recurrencePreset,
      );
      return match ? match.label : recurrencePreset;
    }
    return "";
  }

  function isReminderMissed(reminder: Reminder): boolean {
    if (reminder.status !== "scheduled") return false;
    const target = reminder.next_run_at || reminder.run_at;
    if (!target) return false;
    const dueTime = new Date(target).getTime();
    // If due time was more than 1 hour ago and still in scheduled state, it is missed
    return Date.now() - dueTime > 3600 * 1000;
  }

  return (
    <Stack gap="normal">
      <Card
        title="Reminders & Delivery Status"
        description="Schedule explicit-timezone reminders with verifiable channel receipts. Core enforces strict non-action authority."
        tone="soft"
      >
        <Stack gap="normal">
          {/* Create Reminder Form */}
          <form onSubmit={handleCreate} className="space-y-4">
            <Row spread>
              <div className="flex-1 mr-2">
                <Field
                  id={`${formId}-title`}
                  label="Reminder Title"
                  placeholder="e.g. Project status sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="w-1/3">
                <Select
                  id={`${formId}-timezone`}
                  label="Explicit Timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
              </div>
            </Row>

            <TextArea
              id={`${formId}-message`}
              label="Notification Message"
              placeholder="What should Vox announce when this reminder triggers?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              required
            />

            <Row spread>
              <div className="w-1/3">
                <Select
                  id={`${formId}-channel`}
                  label="Delivery Channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="whatsapp">WhatsApp Message</option>
                  <option value="voice">Voice Phone Call</option>
                  <option value="browser_push">Reference Web Push</option>
                </Select>
              </div>
              <div className="flex-1 ml-2">
                <Field
                  id={`${formId}-destination`}
                  label="Destination (E.164 phone or account handle)"
                  placeholder="+15551234567"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  hint="Must be in E.164 format (+CountryCode...) for voice and WhatsApp."
                  required
                />
              </div>
            </Row>

            {/* Schedule Type Selection */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3">
              <Row spread>
                <div className="w-1/3">
                  <Select
                    id={`${formId}-kind`}
                    label="Schedule Kind"
                    value={scheduleKind}
                    onChange={(e) =>
                      setScheduleKind(e.target.value as ReminderScheduleKind)
                    }
                  >
                    <option value="one_time">One-time</option>
                    <option value="interval">Interval (Fixed Frequency)</option>
                    <option value="recurring">Recurring (Calendar Cron)</option>
                  </Select>
                </div>

                <div className="flex-1 ml-2">
                  {scheduleKind === "one_time" && (
                    <Field
                      id={`${formId}-run-at`}
                      label={`Run At Time (${timezone})`}
                      type="datetime-local"
                      value={runAt}
                      onChange={(e) => setRunAt(e.target.value)}
                      required
                    />
                  )}

                  {scheduleKind === "interval" && (
                    <Select
                      id={`${formId}-interval`}
                      label="Interval Period"
                      value={intervalSeconds}
                      onChange={(e) =>
                        setIntervalSeconds(Number(e.target.value))
                      }
                    >
                      {INTERVAL_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                  )}

                  {scheduleKind === "recurring" && (
                    <div className="space-y-2">
                      <Select
                        id={`${formId}-recurrence`}
                        label="Calendar Schedule"
                        value={recurrencePreset}
                        onChange={(e) => setRecurrencePreset(e.target.value)}
                      >
                        {RECURRENCE_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </Select>
                      {recurrencePreset === "custom" && (
                        <Field
                          id={`${formId}-custom-cron`}
                          label="Custom Cron Expression (e.g. 0 10 * * 1-5)"
                          placeholder="0 9 * * *"
                          value={customCron}
                          onChange={(e) => setCustomCron(e.target.value)}
                          required
                        />
                      )}
                    </div>
                  )}
                </div>
              </Row>
            </div>

            {/* PRE-SAVE DISCLOSURES (Mandatory per PRD FR-REM-003, FR-REM-007, FR-REM-009) */}
            <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded text-xs space-y-1.5 text-neutral-400">
              <div className="font-semibold text-neutral-300">
                Pre-Save Disclosure & Invariants:
              </div>
              <div>
                • <strong>Timezone:</strong> Evaluated in{" "}
                <span className="text-neutral-200">{timezone}</span>.
              </div>
              <div>
                • <strong>Recurrence:</strong> {getRecurrenceLabel()}.
              </div>
              <div>
                • <strong>Channel & Retries:</strong> Dispatches via{" "}
                <span className="text-neutral-200">{channel}</span> to{" "}
                <span className="text-neutral-200">
                  {destination || "(unspecified)"}
                </span>
                . Up to {maxRetries} delivery attempts within a 1-hour retry
                window.
              </div>
              <div className="text-amber-300/90">
                • <strong>Non-Action Authority Invariant:</strong> Reminders
                provide informational notification only and strictly cannot
                execute transactions, authorize payments, or trigger external
                agent writes.
              </div>
            </div>

            <Button type="submit" variant="primary" disabled={creating}>
              {creating
                ? "Registering Reminder with Core..."
                : "Schedule Reminder"}
            </Button>
          </form>

          {error && (
            <div role="alert" aria-live="assertive">
              <Notice title="Notice" tone="error">
                {error}
              </Notice>
            </div>
          )}

          {success && (
            <div role="status" aria-live="polite">
              <Notice title="Success" tone="success">
                {success}
              </Notice>
            </div>
          )}

          {/* Reminders List & Truthful Delivery Status */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <Row spread>
              <h3 className="text-sm font-semibold text-neutral-200">
                Registered Reminders ({reminders.length})
              </h3>
              <Button
                variant="secondary"
                className="text-xs py-1 px-2"
                disabled={loading}
                onClick={loadReminders}
              >
                {loading ? "Refreshing..." : "Refresh Status"}
              </Button>
            </Row>

            {reminders.length === 0 && !loading && (
              <Text muted>
                No active or historical reminders found. Use the schedule form
                above to create your first reminder.
              </Text>
            )}

            <div className="space-y-3">
              {reminders.map((reminder) => {
                const missed = isReminderMissed(reminder);
                const isDelivered = reminder.status === "delivered_to_channel";
                const isFailed = reminder.status === "failed";
                const isUnknown = reminder.status === "unknown";

                const statusKey = missed
                  ? "missed"
                  : isDelivered
                    ? "delivered_to_channel"
                    : isFailed
                      ? "failed"
                      : isUnknown
                        ? "unknown"
                        : reminder.status;
                const statusIndicator = getAccessibleStatusIndicator(statusKey);

                return (
                  <div
                    key={reminder.id}
                    role="region"
                    aria-labelledby={`reminder-title-${reminder.id}`}
                    className="p-4 border border-neutral-800 bg-neutral-950 rounded-lg space-y-3"
                    data-testid={`reminder-${reminder.id}`}
                  >
                    <Row spread>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            id={`reminder-title-${reminder.id}`}
                            className="font-semibold text-neutral-100"
                          >
                            {reminder.title}
                          </h4>
                          {/* TRUTHFUL STATUS BADGES (PRD FR-REM-005, FR-REM-006, FR-REM-008, WCAG 2.2 AA non-color reliance) */}
                          <Badge
                            tone={statusIndicator.badgeTone}
                            aria-label={statusIndicator.ariaLabel}
                            className="flex items-center gap-1.5"
                          >
                            <span aria-hidden="true">
                              {statusIndicator.symbol}
                            </span>
                            <span>{statusIndicator.text}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-300 mt-1">
                          {reminder.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {reminder.status === "scheduled" && !missed && (
                          <Button
                            variant="danger"
                            className="text-xs py-1 px-2"
                            aria-label={`Cancel reminder: ${reminder.title}`}
                            onClick={() => handleCancel(reminder.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          className="text-xs py-1 px-2"
                          aria-expanded={expandedReminderId === reminder.id}
                          aria-label={`${expandedReminderId === reminder.id ? "Hide receipts" : "Show delivery history"} for ${reminder.title}`}
                          onClick={() => toggleDeliveries(reminder.id)}
                        >
                          {expandedReminderId === reminder.id
                            ? "Hide Receipts"
                            : "Delivery History"}
                        </Button>
                      </div>
                    </Row>

                    {/* TRUTHFUL RECOVERY CHOICES FOR FAILED AND MISSED STATES */}
                    {missed && (
                      <div className="p-3 bg-amber-950/60 border border-amber-900 rounded text-xs text-amber-200 space-y-2">
                        <div className="font-semibold">
                          Missed Reminder Notice:
                        </div>
                        <p>
                          This reminder was scheduled for{" "}
                          {(() => {
                            const target =
                              reminder.next_run_at || reminder.run_at;
                            if (!target)
                              return <strong>(unspecified time)</strong>;
                            const dt = formatAuthoritativeDateTime(
                              target,
                              reminder.timezone,
                            );
                            return (
                              <strong aria-label={dt.ariaLabel}>
                                {dt.formattedDateTime} (
                                {dt.authoritativeTimezone})
                              </strong>
                            );
                          })()}
                          , but the delivery window elapsed during system or
                          provider unavailability. Per Vox policy, missed
                          reminders are surfaced for human review rather than
                          silently delivered late.
                        </p>
                        <Row>
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-2"
                            onClick={() => {
                              setTitle(reminder.title);
                              setMessage(reminder.message);
                              setChannel(reminder.channel);
                              setDestination(reminder.destination);
                              setTimezone(reminder.timezone);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Reschedule as New Reminder
                          </Button>
                        </Row>
                      </div>
                    )}

                    {isFailed && (
                      <div className="p-3 bg-rose-950/60 border border-rose-900 rounded text-xs text-rose-200 space-y-2">
                        <div className="font-semibold">Delivery Failed:</div>
                        <p>
                          Provider rejected delivery to {reminder.destination}.
                          You can inspect provider receipts below or
                          re-configure destination.
                        </p>
                        <Row>
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-2"
                            onClick={() => {
                              setTitle(reminder.title);
                              setMessage(reminder.message);
                              setChannel(reminder.channel);
                              setDestination(reminder.destination);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Edit & Retry
                          </Button>
                        </Row>
                      </div>
                    )}

                    {isDelivered && (
                      <div className="p-2 bg-emerald-950/40 border border-emerald-900/60 rounded text-xs text-emerald-300">
                        ✓ Notification accepted by {reminder.channel} carrier at{" "}
                        {reminder.last_attempt_at || "scheduled time"}.
                        (Delivered to carrier does not guarantee recipient has
                        viewed the message.)
                      </div>
                    )}

                    {/* Metadata summary */}
                    <div className="border-t border-neutral-900 pt-2 text-xs text-neutral-400">
                      <Row spread>
                        <span>
                          Timezone: <strong>{reminder.timezone}</strong> ·
                          Schedule: <strong>{reminder.schedule_kind}</strong> (
                          {reminder.channel} → {reminder.destination})
                        </span>
                        <span>
                          Attempts: {reminder.retry_count} /{" "}
                          {reminder.max_retries}
                        </span>
                      </Row>
                    </div>

                    {/* Expandable Delivery Receipts */}
                    {expandedReminderId === reminder.id && (
                      <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded space-y-2 text-xs">
                        <div className="font-semibold text-neutral-200">
                          Provider Delivery Receipts:
                        </div>
                        {loadingDeliveries[reminder.id] ? (
                          <div className="text-neutral-400">
                            Loading delivery logs...
                          </div>
                        ) : !deliveries[reminder.id] ||
                          deliveries[reminder.id].length === 0 ? (
                          <div className="text-neutral-500">
                            No external provider dispatch attempts recorded yet.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {deliveries[reminder.id].map((deliv) => (
                              <div
                                key={deliv.id}
                                className="p-2 border border-neutral-800 bg-neutral-950 rounded flex justify-between items-center"
                              >
                                <div>
                                  <div className="font-medium text-neutral-300">
                                    {deliv.channel.toUpperCase()} dispatch to{" "}
                                    {deliv.destination}
                                  </div>
                                  <div className="text-neutral-500">
                                    Attempted at:{" "}
                                    {new Date(
                                      deliv.attempted_at,
                                    ).toLocaleString()}
                                  </div>
                                  {deliv.failure_reason && (
                                    <div className="text-rose-400">
                                      Error: {deliv.failure_reason}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  {(() => {
                                    const delivInd =
                                      getAccessibleStatusIndicator(
                                        deliv.status,
                                      );
                                    return (
                                      <Badge
                                        tone={delivInd.badgeTone}
                                        aria-label={delivInd.ariaLabel}
                                        className="flex items-center gap-1"
                                      >
                                        <span aria-hidden="true">
                                          {delivInd.symbol}
                                        </span>
                                        <span>{delivInd.text}</span>
                                      </Badge>
                                    );
                                  })()}
                                  {deliv.provider_receipt_id && (
                                    <div className="text-neutral-500 font-mono text-[10px] mt-1">
                                      Receipt: {deliv.provider_receipt_id}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
