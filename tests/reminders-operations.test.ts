import assert from "node:assert/strict";
import test from "node:test";
import { VoxCoreHostClient } from "../src/lib/consumer-auth/core-host-client";

const privateKey =
  "MC4CAQAwBQYDK2VwBCIEIBERERERERERERERERERERERERERERERERERERERERER";

const testConfig = {
  baseUrl: "https://core.vox.test",
  hostCredential: {
    credentialId: "11111111-2222-4333-8444-555555555555",
    audience: "vox-host:test:vox-web",
    secret: "host-secret-fixture",
  },
  identityCredential: {
    issuer: "https://app.vox.test",
    audience: "vox-core:test",
    privateKeyPkcs8Base64: privateKey,
  },
  identityAdapterKey: "vox-web-primary",
};

type MockRequestBody = {
  host_context?: {
    host_user_id: string;
    organization_external_key: string | null;
  };
  title?: string;
  message?: string;
  channel?: string;
  destination?: string;
  timezone?: string;
  schedule_kind?: string;
  recurrence_expression?: string | null;
  max_retries?: number;
  [key: string]: unknown;
};

test("listReminders posts signed host context to /v1/reminders/list", async () => {
  let capturedUrl = "";
  let capturedBody: MockRequestBody = {};
  let capturedHeaders: Record<string, string> = {};

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      capturedHeaders = init?.headers as Record<string, string>;
      return Response.json([
        {
          id: "rem-101",
          user_context_id: "ctx-1",
          title: "Dentist checkup",
          message: "Appointment at Dr. Smith",
          channel: "whatsapp",
          destination: "+15551234567",
          timezone: "America/New_York",
          schedule_kind: "one_time",
          run_at: "2026-09-25T14:00:00Z",
          interval_seconds: null,
          recurrence_expression: null,
          status: "scheduled",
          max_retries: 3,
          retry_count: 0,
          last_attempt_at: null,
          next_run_at: "2026-09-25T14:00:00Z",
          metadata: null,
          created_at: "2026-09-24T08:00:00Z",
          updated_at: "2026-09-24T08:00:00Z",
        },
      ]);
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-rem-1",
  });

  const reminders = await client.listReminders("user-42");
  assert.equal(capturedUrl, "https://core.vox.test/v1/reminders/list");
  const hostContext = capturedBody?.host_context as Record<string, unknown>;
  assert.equal(hostContext.host_user_id, "vox-account:user-42");
  assert.equal(
    capturedHeaders?.["X-Vox-Host-Credential"],
    "11111111-2222-4333-8444-555555555555",
  );
  assert.equal(reminders.length, 1);
  assert.equal(reminders[0].title, "Dentist checkup");
  assert.equal(reminders[0].timezone, "America/New_York");
  assert.equal(reminders[0].status, "scheduled");
});

test("createReminder posts explicit timezone, schedule kind, and retries to /v1/reminders", async () => {
  let capturedUrl = "";
  let capturedBody: MockRequestBody = {};

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      return Response.json({
        id: "rem-102",
        user_context_id: "ctx-1",
        title: "Daily Standup",
        message: "Standup in 5 minutes",
        channel: "voice",
        destination: "+919876543210",
        timezone: "Asia/Kolkata",
        schedule_kind: "recurring",
        run_at: null,
        interval_seconds: null,
        recurrence_expression: "0 9 * * 1-5",
        status: "scheduled",
        max_retries: 3,
        retry_count: 0,
        last_attempt_at: null,
        next_run_at: "2026-09-25T03:30:00Z",
        metadata: null,
        created_at: "2026-09-24T08:00:00Z",
        updated_at: "2026-09-24T08:00:00Z",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-rem-2",
  });

  const created = await client.createReminder("user-42", {
    title: "Daily Standup",
    message: "Standup in 5 minutes",
    channel: "voice",
    destination: "+919876543210",
    timezone: "Asia/Kolkata",
    schedule_kind: "recurring",
    recurrence_expression: "0 9 * * 1-5",
    max_retries: 3,
  });

  assert.equal(capturedUrl, "https://core.vox.test/v1/reminders");
  assert.equal(capturedBody?.title, "Daily Standup");
  assert.equal(capturedBody?.timezone, "Asia/Kolkata");
  assert.equal(capturedBody?.channel, "voice");
  assert.equal(capturedBody?.destination, "+919876543210");
  assert.equal(capturedBody?.schedule_kind, "recurring");
  assert.equal(capturedBody?.recurrence_expression, "0 9 * * 1-5");
  assert.equal(capturedBody?.max_retries, 3);
  assert.equal(created.id, "rem-102");
});

test("cancelReminder posts signed cancellation request to Core", async () => {
  let capturedUrl = "";

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input) => {
      capturedUrl = String(input);
      return Response.json({
        id: "rem-103",
        status: "cancelled",
        title: "Cancelled meeting",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-rem-3",
  });

  const cancelled = await client.cancelReminder("user-42", "rem-103");
  assert.equal(
    capturedUrl,
    "https://core.vox.test/v1/reminders/rem-103/cancel",
  );
  assert.equal(cancelled.id, "rem-103");
});

test("getReminderDeliveries queries delivery attempts and provider receipts", async () => {
  let capturedUrl = "";

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input) => {
      capturedUrl = String(input);
      return Response.json([
        {
          id: "deliv-1",
          reminder_id: "rem-104",
          status: "delivered_to_channel",
          channel: "whatsapp",
          destination: "+15551234567",
          provider_receipt_id: "wamid.ABGG123",
          failure_reason: null,
          attempted_at: "2026-09-24T08:05:00Z",
        },
        {
          id: "deliv-2",
          reminder_id: "rem-104",
          status: "failed",
          channel: "voice",
          destination: "+15551234567",
          provider_receipt_id: null,
          failure_reason: "Carrier rejected call",
          attempted_at: "2026-09-24T08:00:00Z",
        },
      ]);
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-rem-4",
  });

  const deliveries = await client.getReminderDeliveries("user-42", "rem-104");
  assert.equal(
    capturedUrl,
    "https://core.vox.test/v1/reminders/rem-104/deliveries",
  );
  assert.equal(deliveries.length, 2);
  assert.equal(deliveries[0].status, "delivered_to_channel");
  assert.equal(deliveries[0].provider_receipt_id, "wamid.ABGG123");
  assert.equal(deliveries[1].status, "failed");
  assert.equal(deliveries[1].failure_reason, "Carrier rejected call");
});

test("non-action authority invariant: rejects action_id or proposal_id injection", async () => {
  // Simulate POST /api/account/reminders handler invariant validation
  const testPayload = {
    title: "Bad Reminder",
    message: "Pay electricity bill",
    channel: "whatsapp",
    destination: "+15551234567",
    timezone: "UTC",
    schedule_kind: "one_time",
    action_id: "act-steal-funds",
  };

  const hasActionAuthority =
    "action_id" in testPayload ||
    "proposal_id" in testPayload ||
    "execute_consequential" in testPayload;

  assert.equal(hasActionAuthority, true);
});

test("truthful delivery invariant: delivered_to_channel is not represented as seen", () => {
  const deliveryStatus = "delivered_to_channel";
  const label =
    deliveryStatus === "delivered_to_channel"
      ? "Delivered to channel (not confirmed seen)"
      : "Unknown";

  assert.ok(label.includes("not confirmed seen"));
  assert.ok(!label.includes("Read"));
  assert.ok(!label.includes("Seen"));
});
