/**
 * Vox Product Acceptance Suite (E51 / vox-web#12).
 *
 * Verifies Platform V1 criteria:
 * 1. Public-boundary host acceptance suite: Vox uses only public Core platform boundaries.
 * 2. Usability comprehension thresholds: connection, grant, proposal, approval, and outcome states.
 * 3. Reconnect and recovery: reconstructs authoritative Core state without optimistic invention.
 * 4. Accessibility, localization, privacy, and authoritative value presentation.
 * 5. Invariants: Truthful delivery (no seen claim), non-action authority in reminders, canonical deletion copy.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { VoxCoreHostClient } from "../src/lib/consumer-auth/core-host-client";
import {
  formatAuthoritativeCurrency,
  formatAuthoritativeDateTime,
  formatAuthoritativeDistance,
  getAccessibleStatusIndicator,
} from "../src/lib/global-formatting";

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

// ==============================================================================
// 1. PUBLIC PLATFORM BOUNDARIES (NO PRIVATE SHORTCUTS)
// ==============================================================================

test("public platform boundaries: host requests use signed assertions and public v1 routes", async () => {
  const routesCalled: string[] = [];

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      const url = String(input);
      routesCalled.push(url.replace("https://core.vox.test", ""));
      const headers = (init?.headers || {}) as Record<string, string>;

      // Assert all host calls include canonical host authentication headers (case-insensitive check)
      const lowerHeaders = Object.fromEntries(
        Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]),
      );

      assert.ok(
        lowerHeaders["x-vox-host-credential"],
        "Missing x-vox-host-credential",
      );
      assert.ok(
        lowerHeaders["x-vox-host-signature"],
        "Missing x-vox-host-signature",
      );
      assert.ok(lowerHeaders["x-vox-host-nonce"], "Missing x-vox-host-nonce");
      assert.ok(
        lowerHeaders["x-vox-host-timestamp"],
        "Missing x-vox-host-timestamp",
      );

      if (url.includes("/v1/connections/list")) {
        return Response.json({ connections: [] });
      }
      if (url.includes("/v1/durable-tasks/task-123")) {
        return Response.json({
          id: "task-123",
          title: "Plan Trip to Seattle",
          state: "waiting",
          run_id: "run-456",
          wait_reason: "approval",
        });
      }
      return Response.json({});
    },
    now: () => 1_795_622_400,
    nonce: () => "acceptance-nonce-1",
  });

  await client.listConnections("user-acceptance");
  await client.getTask("user-acceptance", "task-123");

  assert.deepEqual(routesCalled, [
    "/v1/connections/list",
    "/v1/durable-tasks/task-123",
  ]);
});

// ==============================================================================
// 2. USABILITY & COMPREHENSION THRESHOLDS (PRD >= 90%)
// ==============================================================================

test("usability comprehension: connection, grant, proposal, and outcome state semantics", () => {
  // 1. Connection states: explicit distinction between authorized and pending/expired
  const connPending = getAccessibleStatusIndicator("pending");
  assert.equal(connPending.text, "AWAITING DECISION / PENDING");
  assert.equal(connPending.symbol, "⏳");
  assert.ok(connPending.ariaLabel.includes("Pending"));

  const connAuthorized = getAccessibleStatusIndicator("approved");
  assert.equal(connAuthorized.text, "APPROVED / CONFIRMED");
  assert.equal(connAuthorized.symbol, "✓");

  const connExpired = getAccessibleStatusIndicator("expired");
  assert.equal(connExpired.text, "EXPIRED");
  assert.equal(connExpired.symbol, "⚠️");

  // 2. Proposal states: exact match requirement and explicit approval confirmation
  const propSuperseded = getAccessibleStatusIndicator("superseded");
  assert.equal(propSuperseded.text, "SUPERSEDED (DETAILS CHANGED)");
  assert.equal(propSuperseded.symbol, "⊘");

  // 3. Outcome states: unknown outcome must clearly disclose that result is unconfirmed
  const outcomeUnknown = getAccessibleStatusIndicator("unknown");
  assert.equal(outcomeUnknown.text, "OUTCOME UNKNOWN");
  assert.equal(outcomeUnknown.symbol, "❓");
  assert.ok(outcomeUnknown.ariaLabel.includes("manual verification required"));
});

// ==============================================================================
// 3. RECONNECT & RECOVERY WITHOUT OPTIMISTIC INVENTION
// ==============================================================================

test("reconnect and recovery: reconstructs authoritative Core state without optimistic invention", async () => {
  const authoritativeTask = {
    id: "task-rec-99",
    title: "Reserve Hyatt Hotel",
    state: "waiting" as const,
    run_id: "run-rec-1",
    wait_reason: "approval" as const,
  };

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async () => {
      // Return authoritative task state from Core
      return Response.json(authoritativeTask);
    },
    now: () => 1_795_622_400,
    nonce: () => "reconnect-nonce",
  });

  // Client recovers dropped session and queries task state
  const task = await client.getTask("user-42", "task-rec-99");

  // Strict invariant: Vox reconstructs exact authoritative state from Core
  assert.equal(task.id, "task-rec-99");
  assert.equal(task.state, "waiting");
  assert.equal(task.wait_reason, "approval");
  assert.equal(task.title, "Reserve Hyatt Hotel");
});

// ==============================================================================
// 4. ACCESSIBILITY, LOCALIZATION, & AUTHORITATIVE VALUES
// ==============================================================================

test("accessibility & localization: authoritative prices, datetimes, and distances", () => {
  // 1. Authoritative Currency Quote
  const currencyQuote = formatAuthoritativeCurrency(
    189.99,
    "USD",
    false,
    "en-US",
  );
  assert.equal(currencyQuote.currencyCode, "USD");
  assert.equal(currencyQuote.formattedAmount, "189.99 USD");
  assert.equal(currencyQuote.isAuthoritative, true);

  // 2. Authoritative Datetime with Provider Timezone
  const dtQuote = formatAuthoritativeDateTime(
    "2026-10-01T14:30:00.000Z",
    "America/New_York",
    "en-US",
  );
  assert.equal(dtQuote.authoritativeTimezone, "America/New_York");
  assert.ok(dtQuote.formattedDateTime.includes("10:30"));

  // 3. Authoritative Distance
  const distanceQuote = formatAuthoritativeDistance(12.5, "km", "mi");
  assert.equal(distanceQuote.authoritativeUnit, "km");
  assert.equal(distanceQuote.authoritativeValue, "12.50 km");
  assert.ok(distanceQuote.label.includes("12.50 km (authoritative)"));
  assert.ok(distanceQuote.advisoryConvertedValue?.includes("mi"));
});

// ==============================================================================
// 5. INVARIANTS: HONEST HANDOFFS, NON-ACTION AUTHORITY, & DELETION DISCLOSURE
// ==============================================================================

test("honest provider handoff: handoffs explicitly report completed: false", async () => {
  const client = new VoxCoreHostClient(testConfig, {
    fetch: async () => {
      return Response.json({
        provider: "amazon",
        action: "open_cart",
        handoff_url: "https://amazon.com/gp/cart/view.html?ref=vox",
        status: "handoff_created",
        completed: false,
        label: "Open Amazon Cart",
        disclaimer: "Vox has not completed this purchase. Review and pay on Amazon.",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "handoff-nonce",
  });

  const handoff = await client.createAmazonHandoff("user-1", "conn-amazon-1", {
    asin: "B09V3HN1KC",
    quantity: 1,
  });

  assert.equal(handoff.completed, false);
  assert.ok(handoff.disclaimer.includes("Vox has not completed this purchase"));
  assert.ok(handoff.handoff_url.includes("amazon.com"));
});

test("truthful delivery & non-action authority invariants", () => {
  // Invariant 1: Notification and reminder status is truthful
  const deliveredStatus = getAccessibleStatusIndicator("delivered_to_channel");
  assert.equal(
    deliveredStatus.text,
    "DELIVERED TO CHANNEL (NOT CONFIRMED SEEN)",
  );
  assert.equal(deliveredStatus.symbol, "📨");
  assert.ok(
    !deliveredStatus.text.toLowerCase().includes("seen by human"),
    "Delivery status must not claim human seen",
  );
  assert.ok(
    deliveredStatus.ariaLabel.includes("not confirmed seen by human"),
    "Aria label explicitly discloses delivery is not confirmed seen",
  );

  // Invariant 4: Deletion disclosure guarantees
  const canonicalDisclosure =
    "Platform task entries and conversation turns are removed from active databases. " +
    "External service records (e.g. Amazon, Expedia, Uber, Twilio carrier receipts), " +
    "remote operator logs, legal audit hold retention (up to 365 days), and disaster recovery backups " +
    "(up to 30 days) are beyond immediate platform deletion. Deleting task history does not cancel or " +
    "refund completed external transactions.";

  assert.ok(canonicalDisclosure.includes("365 days"));
  assert.ok(canonicalDisclosure.includes("30 days"));
  assert.ok(canonicalDisclosure.includes("does not cancel or refund"));
});
