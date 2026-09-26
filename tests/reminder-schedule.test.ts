import assert from "node:assert/strict";
import test from "node:test";
import {
  buildReminderInput,
  emptyReminderDraft,
  isReminderMissed,
} from "../src/features/reminders/schedule";
import type { Reminder } from "../src/lib/consumer-auth/core-host-client";

test("an interval reminder draft becomes a Core create request", () => {
  const input = buildReminderInput({
    ...emptyReminderDraft("Asia/Kolkata"),
    title: " Stand-up ",
    message: "Daily stand-up",
    destination: "+15551234567",
    scheduleKind: "interval",
  });
  assert.equal(input.title, "Stand-up");
  assert.equal(input.interval_seconds, 3600);
  assert.equal(input.run_at, null);
  assert.equal(input.recurrence_expression, null);
});

test("a scheduled reminder more than an hour overdue is missed", () => {
  const now = Date.parse("2026-09-26T12:00:00Z");
  const reminder = {
    status: "scheduled",
    run_at: "2026-09-26T10:00:00Z",
    next_run_at: null,
  } as Reminder;
  assert.equal(isReminderMissed(reminder, now), true);
  assert.equal(
    isReminderMissed({ ...reminder, run_at: "2026-09-26T11:30:00Z" }, now),
    false,
  );
});
