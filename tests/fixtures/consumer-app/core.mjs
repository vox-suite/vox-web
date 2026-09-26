#!/usr/bin/env node
// Stateful in-memory mock of Vox Core for the consumer app fixture.
//
// Implements every /v1/* endpoint that VoxCoreHostClient
// (src/lib/consumer-auth/core-host-client.ts) calls. State is keyed by
// host_context.host_user_id ("vox-account:<supabase user id>") and seeded
// lazily with realistic data the first time a user is seen.
//
// Host assertions are NOT verified cryptographically: a request only has to
// carry the X-Vox-Host-Credential header and a host user id.
//
// Fixture-only control routes (not part of Core):
//   GET  /health
//   GET  /__fixture/state?host_user_id=vox-account:<id>   dump one user's state
//   POST /__fixture/reset                                 drop all state (reseed lazily)
//   POST /__fixture/connections/<id>/state {"authorization_state":"authorized"}
//   POST /__fixture/tasks/<id>/state {"state":"waiting_for_approval","wait_reason":"..."}
//   GET  /exports/<export_id>.json                        portable export download
//
// Usage: node tests/fixtures/consumer-app/core.mjs [--port 3201]

import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

export const DEFAULT_CORE_PORT = 3201;

const PREFERENCE_DISCLAIMER =
  "Preferences are advisory context for agents. They never grant capability, payment or action authority.";
const DELETION_DISCLOSURE =
  "Platform task entries and conversation turns are removed from active databases. " +
  "External service records (e.g. Amazon, Expedia, Uber, Twilio carrier receipts), " +
  "remote operator system logs, mandatory audit hold retention, and cold backups " +
  "(retained for 30 days before rolling expiration) cannot be retroactively destroyed. " +
  "Deleting task history DOES NOT undo, cancel, or refund completed external transactions.";
const HANDOFF_DISCLAIMER =
  "This is a labelled handoff. Vox has not placed an order or made a payment; you complete the action in the provider's own app or site.";

// ---------------------------------------------------------------------------
// Time helpers

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const iso = (ms) => new Date(ms).toISOString();

function nextLocalMorning(now, hourUtc = 2, minuteUtc = 30) {
  // 08:00 IST == 02:30 UTC
  const d = new Date(now);
  d.setUTCHours(hourUtc, minuteUtc, 0, 0);
  if (d.getTime() <= now) d.setTime(d.getTime() + DAY);
  return d.getTime();
}

// ---------------------------------------------------------------------------
// Static catalogue data

const AGENTS = [
  {
    definition: {
      external_key: "saathi",
      display_name: "Saathi",
      purpose:
        "Everyday personal assistant: reminders, calendar, rides and small errands.",
      version: 3,
    },
    selected_at: "2026-01-04T05:12:00.000Z",
    is_default: true,
  },
  {
    definition: {
      external_key: "concierge",
      display_name: "Concierge",
      purpose:
        "Travel and stays: searches lodging, prepares bookings for your explicit approval.",
      version: 1,
    },
    selected_at: "2026-02-18T11:40:00.000Z",
    is_default: false,
  },
];

const LODGING_PROPERTIES = [
  {
    property_id: "prop_goa_tamarind",
    name: "Tamarind Courtyard Stay",
    location: "Assagao, Goa",
    star_rating: 4,
    price_amount_minor: 820000,
    currency: "INR",
    available_rate_plans: [
      {
        rate_plan_id: "rp_goa_tamarind_flex",
        room_name: "Garden Room, Queen Bed",
        refundable: true,
        cancellation_deadline: "2026-09-29T12:00:00.000Z",
      },
      {
        rate_plan_id: "rp_goa_tamarind_saver",
        room_name: "Garden Room, Queen Bed (Non-refundable)",
        refundable: false,
        cancellation_deadline: null,
      },
    ],
  },
  {
    property_id: "prop_goa_palolem",
    name: "Palolem Shoreline Cottages",
    location: "Palolem, Goa",
    star_rating: 3,
    price_amount_minor: 540000,
    currency: "INR",
    available_rate_plans: [
      {
        rate_plan_id: "rp_goa_palolem_flex",
        room_name: "Sea-view Cottage",
        refundable: true,
        cancellation_deadline: "2026-09-28T12:00:00.000Z",
      },
    ],
  },
  {
    property_id: "prop_jaipur_haveli",
    name: "Chandpol Haveli",
    location: "Jaipur, Rajasthan",
    star_rating: 4,
    price_amount_minor: 690000,
    currency: "INR",
    available_rate_plans: [
      {
        rate_plan_id: "rp_jaipur_haveli_flex",
        room_name: "Heritage Room",
        refundable: true,
        cancellation_deadline: "2026-09-30T12:00:00.000Z",
      },
    ],
  },
  {
    property_id: "prop_blr_indiranagar",
    name: "Indiranagar Residency",
    location: "Indiranagar, Bengaluru",
    star_rating: 3,
    price_amount_minor: 450000,
    currency: "INR",
    available_rate_plans: [
      {
        rate_plan_id: "rp_blr_indiranagar_saver",
        room_name: "Studio (Non-refundable)",
        refundable: false,
        cancellation_deadline: null,
      },
    ],
  },
  {
    property_id: "prop_mumbai_bandra",
    name: "Bandstand Suites",
    location: "Bandra West, Mumbai",
    star_rating: 5,
    price_amount_minor: 1450000,
    currency: "INR",
    available_rate_plans: [
      {
        rate_plan_id: "rp_mumbai_bandra_flex",
        room_name: "Deluxe King, Sea View",
        refundable: true,
        cancellation_deadline: "2026-09-30T18:00:00.000Z",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Per-user seed

function seedUser(hostUserId) {
  const now = Date.now();
  const accountId = hostUserId.replace(/^vox-account:/, "");
  const userContextId = `ctx_${accountId.replace(/-/g, "").slice(0, 16)}`;
  const t = (offsetMs) => iso(now + offsetMs);

  const connections = [
    {
      id: "conn_gcal_primary",
      integration_external_key: "google-calendar",
      external_account_reference: "gcal:primary",
      account_display_id: "asha.raman@example.test",
      credential_custody: "platform_held",
      authorization_state: "authorized",
      authorized_capabilities: [
        "calendar.events.read",
        "calendar.events.write",
      ],
      expires_at: t(52 * DAY),
      failure_code: null,
      created_at: t(-40 * DAY),
      updated_at: t(-2 * DAY),
    },
    {
      id: "conn_uber_rides",
      integration_external_key: "uber",
      external_account_reference: "uber:rider:7f3a",
      account_display_id: "Asha R. (Uber rider)",
      credential_custody: "external_operator",
      authorization_state: "authorized",
      authorized_capabilities: [
        "uber.trips.read",
        "uber.rides.request_handoff",
      ],
      expires_at: t(20 * DAY),
      failure_code: null,
      created_at: t(-25 * DAY),
      updated_at: t(-25 * DAY),
    },
    {
      id: "conn_expedia_travel",
      integration_external_key: "expedia",
      external_account_reference: "expedia:partner:asha",
      account_display_id: "Expedia traveller profile",
      credential_custody: "external_operator",
      authorization_state: "expired",
      authorized_capabilities: ["lodging.search", "lodging.book"],
      expires_at: t(-3 * DAY),
      failure_code: "token_expired",
      created_at: t(-90 * DAY),
      updated_at: t(-3 * DAY),
    },
  ];

  const grants = [
    {
      id: "grant_saathi_gcal_read",
      agent_external_key: "saathi",
      connection_id: "conn_gcal_primary",
      capability_external_key: "calendar.events.read",
    },
    {
      id: "grant_saathi_uber_trips",
      agent_external_key: "saathi",
      connection_id: "conn_uber_rides",
      capability_external_key: "uber.trips.read",
    },
  ];

  const skills = [
    {
      id: "skill_morning_brief",
      external_key: "morning-brief",
      title: "Morning brief",
      summary:
        "A short spoken summary of today's calendar, reminders and commute each morning.",
      curated: true,
      latest_version: 2,
      installed_version: 2,
      enabled: true,
      update_available: false,
      owner: "vox",
      versions: {
        1: {
          version: 1,
          instructions:
            "Summarise the user's calendar for today in under 90 words.",
          requested_capabilities: ["calendar.events.read"],
          resources: {},
        },
        2: {
          version: 2,
          instructions:
            "Summarise today's calendar and due reminders in under 90 words. Mention the first commitment and any conflicts. Never create or change events.",
          requested_capabilities: ["calendar.events.read"],
          resources: { "tone.md": "Warm, brief, no filler." },
        },
      },
    },
    {
      id: "skill_trip_planner",
      external_key: "trip-planner",
      title: "Trip planner",
      summary:
        "Builds a day-by-day plan for a trip and proposes stays for your approval.",
      curated: true,
      latest_version: 3,
      installed_version: 2,
      enabled: true,
      update_available: true,
      owner: "vox",
      versions: {
        2: {
          version: 2,
          instructions:
            "Draft a day-by-day itinerary. Suggest at most three stays. Ask before any booking.",
          requested_capabilities: ["lodging.search"],
          resources: {},
        },
        3: {
          version: 3,
          instructions:
            "Draft a day-by-day itinerary with travel times between stops. Suggest at most three stays with refundable options first. Prepare a booking proposal only after the user picks a stay; never book without explicit approval.",
          requested_capabilities: ["lodging.search", "lodging.book"],
          resources: {
            "checklist.md": "- Dates\n- Budget per night\n- Refundability",
          },
        },
      },
    },
    {
      id: "skill_private_grocery",
      external_key: "grocery-list-style",
      title: "My grocery list style",
      summary:
        "Groups grocery items by aisle the way I shop at my local store.",
      curated: false,
      latest_version: 1,
      installed_version: null,
      enabled: false,
      update_available: false,
      owner: hostUserId,
      versions: {
        1: {
          version: 1,
          instructions:
            "When asked for a grocery list, group items as: produce, dairy, staples, snacks. Use metric quantities.",
          requested_capabilities: [],
          resources: {},
        },
      },
    },
  ];

  const extensions = [
    {
      id: "ext_notion_workspace",
      external_key: "notion-workspace",
      display_name: "Notion workspace",
      protocol: "mcp",
      endpoint_url: "https://mcp.notion.example.test/v1",
      operator: {
        operator_id: "op_notion_labs",
        operator_name: "Notion Labs (example operator)",
        support_email: "support@notion.example.test",
        terms_url: "https://notion.example.test/terms",
      },
      current_version: 2,
      conformance_status: "passed",
      operator_enabled: true,
      consent_status: "consented",
      lifecycle_state: "active",
      created_at: t(-30 * DAY),
      updated_at: t(-6 * DAY),
      capabilities: [
        {
          external_key: "notion.pages.read",
          display_name: "Read pages you share",
          effect: "read",
          consequential: false,
          data_recipients: ["Notion Labs"],
          access_needs: ["Pages explicitly shared with the Vox integration"],
        },
        {
          external_key: "notion.pages.create",
          display_name: "Create pages",
          effect: "write",
          consequential: true,
          data_recipients: ["Notion Labs"],
          access_needs: ["Write access to one chosen parent page"],
        },
      ],
    },
    {
      id: "ext_splitwise_direct",
      external_key: "splitwise-expenses",
      display_name: "Splitwise expenses",
      protocol: "direct",
      endpoint_url: "https://api.splitwise.example.test/vox",
      operator: {
        operator_id: "op_splitwise",
        operator_name: "Splitwise (example operator)",
        support_email: null,
        terms_url: "https://splitwise.example.test/terms",
      },
      current_version: 3,
      conformance_status: "pending",
      operator_enabled: true,
      consent_status: "consent_required",
      lifecycle_state: "quarantined",
      created_at: t(-14 * DAY),
      updated_at: t(-1 * DAY),
      capabilities: [
        {
          external_key: "splitwise.balances.read",
          display_name: "Read balances",
          effect: "read",
          consequential: false,
          data_recipients: ["Splitwise"],
        },
        {
          external_key: "splitwise.expenses.create",
          display_name: "Add shared expenses",
          effect: "write",
          consequential: true,
          data_recipients: ["Splitwise", "Group members"],
          access_needs: ["Groups you choose"],
        },
      ],
    },
  ];

  const reminderBase = {
    user_context_id: userContextId,
    timezone: "Asia/Kolkata",
    max_retries: 3,
    interval_seconds: null,
    recurrence_expression: null,
    metadata: null,
  };
  const tomorrowMorning = nextLocalMorning(now);
  const missedAt = now - 3 * HOUR;
  const reminders = [
    {
      ...reminderBase,
      id: "rem_vitamin_d",
      title: "Take vitamin D",
      message: "Morning vitamin D with breakfast.",
      channel: "whatsapp",
      destination: "+91 90000 00001",
      schedule_kind: "one_time",
      run_at: iso(tomorrowMorning),
      status: "scheduled",
      retry_count: 0,
      last_attempt_at: null,
      next_run_at: iso(tomorrowMorning),
      created_at: t(-1 * DAY),
      updated_at: t(-1 * DAY),
    },
    {
      ...reminderBase,
      id: "rem_call_landlord",
      title: "Call the landlord",
      message: "Ask about the lease renewal before the weekend.",
      channel: "sms",
      destination: "+91 90000 00001",
      schedule_kind: "one_time",
      run_at: iso(missedAt),
      status: "scheduled",
      retry_count: 0,
      last_attempt_at: null,
      next_run_at: iso(missedAt),
      created_at: t(-2 * DAY),
      updated_at: t(-2 * DAY),
    },
    {
      ...reminderBase,
      id: "rem_water_plants",
      title: "Water the balcony plants",
      message: "Water the tulsi and the money plant.",
      channel: "whatsapp",
      destination: "+91 90000 00001",
      schedule_kind: "recurring",
      run_at: null,
      recurrence_expression: "0 19 * * *",
      status: "delivered_to_channel",
      retry_count: 0,
      last_attempt_at: t(-17 * HOUR),
      next_run_at: t(7 * HOUR),
      created_at: t(-10 * DAY),
      updated_at: t(-17 * HOUR),
    },
    {
      ...reminderBase,
      id: "rem_pay_electricity",
      title: "Pay electricity bill",
      message: "BESCOM bill is due on the 28th.",
      channel: "email",
      destination: "asha.raman@example.test",
      schedule_kind: "one_time",
      run_at: t(-26 * HOUR),
      status: "failed",
      retry_count: 3,
      last_attempt_at: t(-25 * HOUR),
      next_run_at: null,
      created_at: t(-5 * DAY),
      updated_at: t(-25 * HOUR),
    },
  ];
  const deliveries = [
    {
      id: "dlv_water_1",
      reminder_id: "rem_water_plants",
      status: "delivered_to_channel",
      channel: "whatsapp",
      destination: "+91 90000 00001",
      provider_receipt_id: "wamid.HBgMOTE5MDAwMDAwMDAxFQIAERgS",
      failure_reason: null,
      attempted_at: t(-41 * HOUR),
    },
    {
      id: "dlv_water_2",
      reminder_id: "rem_water_plants",
      status: "delivered_to_channel",
      channel: "whatsapp",
      destination: "+91 90000 00001",
      provider_receipt_id: "wamid.HBgMOTE5MDAwMDAwMDAxFQIAERgT",
      failure_reason: null,
      attempted_at: t(-17 * HOUR),
    },
    {
      id: "dlv_electricity_1",
      reminder_id: "rem_pay_electricity",
      status: "failed",
      channel: "email",
      destination: "asha.raman@example.test",
      provider_receipt_id: null,
      failure_reason: "Mailbox unavailable (550 5.1.1); retries exhausted",
      attempted_at: t(-25 * HOUR),
    },
  ];

  const preference = (id, category, key, value, sensitive, ageDays) => ({
    id,
    user_context_id: userContextId,
    category,
    preference_key: key,
    value,
    is_sensitive: sensitive,
    confirmed_at: sensitive ? t(-ageDays * DAY) : null,
    created_at: t(-ageDays * DAY),
    updated_at: t(-ageDays * DAY),
    authority_disclaimer: PREFERENCE_DISCLAIMER,
  });
  const preferences = [
    preference("pref_seat", "travel", "seat_preference", "aisle", false, 20),
    preference(
      "pref_cuisine",
      "dining",
      "favourite_cuisines",
      ["South Indian", "Thai", "Lebanese"],
      false,
      12,
    ),
    preference(
      "pref_channel",
      "communication",
      "reminder_channel",
      "whatsapp",
      false,
      9,
    ),
    preference("pref_allergies", "health", "allergies", "Peanuts", true, 30),
  ];

  const tasks = [
    {
      id: "task_seed_weekend_plan",
      title: "Plan a Goa weekend",
      instruction:
        "Find two refundable stays in North Goa for 10-12 October under Rs 9,000 a night.",
      agent_external_key: "concierge",
      state: "waiting_for_approval",
      run_id: "run_seed_weekend_plan",
      wait_reason: "Approve the proposed stay at Tamarind Courtyard Stay.",
      created_at: t(-3 * HOUR),
      updated_at: t(-2 * HOUR),
      pinned: true,
    },
    {
      id: "task_seed_calendar_digest",
      title: "Summarise next week",
      instruction: "Summarise my calendar for next week and flag conflicts.",
      agent_external_key: "saathi",
      state: "completed",
      run_id: "run_seed_calendar_digest",
      wait_reason: null,
      created_at: t(-1 * DAY),
      updated_at: t(-1 * DAY + 2 * MINUTE),
      pinned: true,
    },
  ];

  const proposals = [
    {
      id: "prop_seed_goa_stay",
      capability_external_key: "lodging.book",
      expires_at: t(22 * HOUR),
      approval_id: null,
      state: "pending",
      span_id: "span_seed_goa",
      task_run_id: "run_seed_weekend_plan",
      agent_external_key: "concierge",
      details: {
        title: "Book Tamarind Courtyard Stay, 10-12 Oct",
        provider: "Expedia",
        account_reference: "Expedia traveller profile",
        location: "Assagao, Goa",
        time: "2026-10-10 to 2026-10-12",
        price: 16400,
        currency: "INR",
        fees: 1476,
        data_recipients: ["Expedia", "Tamarind Courtyard Stay"],
      },
    },
  ];

  const uberTrips = [
    [
      "trip_7a1",
      2,
      "completed",
      6.2,
      "Bengaluru",
      [12.9716, 77.6412],
      [12.9352, 77.6245],
    ],
    [
      "trip_7a2",
      3,
      "completed",
      11.8,
      "Bengaluru",
      [12.9352, 77.6245],
      [13.1986, 77.7066],
    ],
    [
      "trip_7a3",
      6,
      "completed",
      3.4,
      "Mumbai",
      [19.0596, 72.8295],
      [19.0176, 72.8562],
    ],
    [
      "trip_7a4",
      9,
      "rider_canceled",
      0,
      "Mumbai",
      [19.0176, 72.8562],
      [19.076, 72.8777],
    ],
    [
      "trip_7a5",
      14,
      "completed",
      8.9,
      "Bengaluru",
      [12.9784, 77.6408],
      [12.9279, 77.6271],
    ],
    [
      "trip_7a6",
      21,
      "completed",
      4.1,
      "Bengaluru",
      [12.9719, 77.5937],
      [12.9784, 77.6408],
    ],
  ].map(([trip_id, daysAgo, status, distance_miles, start_city, from, to]) => ({
    trip_id,
    request_time: t(-daysAgo * DAY - 5 * HOUR),
    status,
    distance_miles,
    start_city,
    pickup_latitude: from[0],
    pickup_longitude: from[1],
    dropoff_latitude: to[0],
    dropoff_longitude: to[1],
  }));

  const lodgingBookings = [
    {
      booking_id: "bk_seed_jaipur",
      expedia_booking_ref: "EXP-7Q2K9D",
      property_id: "prop_jaipur_haveli",
      status: "confirmed",
      check_in: "2026-11-14",
      check_out: "2026-11-16",
      total_amount_minor: 1380000,
      currency: "INR",
      cancellation_policy:
        "Free cancellation until 2026-11-12 12:00 IST; after that the first night is charged.",
      created_at: t(-8 * DAY),
      rate_plan_id: "rp_jaipur_haveli_flex",
      refundable: true,
    },
  ];

  return {
    hostUserId,
    userContextId,
    connections,
    grants,
    agentSkillDisabled: { saathi: [], concierge: ["skill_morning_brief"] },
    skills,
    extensions,
    reminders,
    deliveries,
    preferences,
    tasks,
    proposals,
    uberTrips,
    lodgingBookings,
    exports: [],
    conversations: 7,
  };
}

// ---------------------------------------------------------------------------
// Shapes

const skillListing = (s) => ({
  id: s.id,
  external_key: s.external_key,
  title: s.title,
  summary: s.summary,
  curated: s.curated,
  latest_version: s.latest_version,
  installed_version: s.installed_version,
  enabled: s.enabled,
  update_available:
    s.installed_version !== null && s.installed_version < s.latest_version,
});

const publicTask = (task) => {
  const copy = { ...task };
  delete copy.pinned;
  return copy;
};

const publicProposal = (p) => ({
  id: p.id,
  capability_external_key: p.capability_external_key,
  expires_at: p.expires_at,
  approval_id: p.approval_id,
  state: p.state,
  details: p.details,
});

const publicBooking = (b) => {
  const copy = { ...b };
  delete copy.rate_plan_id;
  delete copy.refundable;
  return copy;
};

// Tasks advance with wall-clock time unless pinned by seed or fixture control.
function advanceTask(task) {
  if (task.pinned) return task;
  if (["cancelled", "completed", "failed"].includes(task.state)) return task;
  const age = Date.now() - Date.parse(task.created_at);
  const needsApproval = /\b(book|buy|pay|order|send money|transfer)\b/i.test(
    task.instruction,
  );
  let state = "queued";
  let wait = null;
  if (age >= 2_000) state = "running";
  if (age >= 8_000) {
    if (needsApproval) {
      state = "waiting_for_approval";
      wait = "This task needs your explicit approval before Vox acts.";
    } else state = "completed";
  }
  if (state !== task.state) {
    task.state = state;
    task.wait_reason = wait;
    task.updated_at = iso(Date.now());
    if (state === "waiting_for_approval") task.pinned = true;
  }
  return task;
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableJson(value[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

// ---------------------------------------------------------------------------
// HTTP plumbing

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
const fail = (status, code, message) => {
  throw new HttpError(status, code, message);
};

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    fail(400, "invalid_json", "Request body must be JSON");
  }
}

function log(...args) {
  if (process.env.CONSUMER_FIXTURE_QUIET !== "1")
    console.log("[fixture-core]", ...args);
}

// ---------------------------------------------------------------------------
// Server

export function createCoreFixture() {
  const users = new Map();

  function stateFor(hostUserId) {
    if (!hostUserId || !String(hostUserId).startsWith("vox-account:")) {
      fail(401, "host_user_required", "host_context.host_user_id is required");
    }
    if (!users.has(hostUserId)) {
      log("seeding state for", hostUserId);
      users.set(hostUserId, seedUser(hostUserId));
    }
    return users.get(hostUserId);
  }

  const find = (list, predicate, what) =>
    list.find(predicate) ?? fail(404, "not_found", `${what} not found`);

  function requireAuthorizedConnection(user, connectionId, integration) {
    const connection = find(
      user.connections,
      (c) => c.id === connectionId,
      "Connection",
    );
    if (integration && connection.integration_external_key !== integration) {
      fail(
        409,
        "wrong_integration",
        `Connection ${connectionId} is ${connection.integration_external_key}, not ${integration}`,
      );
    }
    if (connection.authorization_state !== "authorized") {
      fail(
        409,
        `connection_${connection.authorization_state}`,
        `Connection ${connectionId} is ${connection.authorization_state}; reconnect it first`,
      );
    }
    return connection;
  }

  function requireGrant(user, agentKey, connectionId, capability) {
    const ok = user.grants.some(
      (g) =>
        g.agent_external_key === agentKey &&
        g.connection_id === connectionId &&
        g.capability_external_key === capability,
    );
    if (!ok) {
      fail(
        403,
        "capability_not_granted",
        `Agent ${agentKey} has no ${capability} grant on ${connectionId}`,
      );
    }
  }

  // Each route: [method, regex, handler(user, match, body, url)]
  const routes = [
    // Identity (used by account-authority sign-in path)
    [
      "POST",
      /^\/v1\/identity\/authentications$/,
      (user) => ({
        user_context_id: user.userContextId,
        adapter_external_key: "vox-web-consumer-fixture",
        expires_at: iso(Date.now() + 10 * MINUTE),
      }),
    ],

    // Connections
    ["POST", /^\/v1\/connections\/list$/, (user) => user.connections],
    [
      "POST",
      /^\/v1\/connections\/initiate$/,
      (user, _m, body) => {
        const initiation = body.initiation ?? {};
        if (!initiation.integration_external_key)
          fail(400, "invalid_request", "integration_external_key is required");
        const sessionId = `cs_${randomUUID().slice(0, 12)}`;
        const now = Date.now();
        user.connections.push({
          id: `conn_${randomUUID().slice(0, 8)}`,
          integration_external_key: initiation.integration_external_key,
          external_account_reference: `pending:${sessionId}`,
          account_display_id: null,
          credential_custody:
            initiation.credential_custody ?? "external_operator",
          authorization_state: "pending",
          authorized_capabilities: [],
          expires_at: null,
          failure_code: null,
          created_at: iso(now),
          updated_at: iso(now),
        });
        return {
          session_id: sessionId,
          integration_external_key: initiation.integration_external_key,
          state_token: randomUUID(),
          authorization_url: `https://auth.${initiation.integration_external_key}.example.test/oauth/authorize?state=${sessionId}&scope=${encodeURIComponent((initiation.requested_capabilities ?? []).join(" "))}`,
          expires_at: iso(now + 10 * MINUTE),
        };
      },
    ],
    [
      "POST",
      /^\/v1\/connections\/([^/]+)\/disconnect$/,
      (user, [, id]) => {
        const connection = find(
          user.connections,
          (c) => c.id === id,
          "Connection",
        );
        connection.authorization_state = "revoked";
        connection.authorized_capabilities = [];
        connection.updated_at = iso(Date.now());
        user.grants = user.grants.filter((g) => g.connection_id !== id);
        return connection;
      },
    ],

    // Agents + grants
    ["POST", /^\/v1\/agents\/selected$/, () => AGENTS],
    [
      "POST",
      /^\/v1\/agents\/([^/]+)\/effective-capability-grants$/,
      (user, [, agentKey]) =>
        user.grants.filter((g) => g.agent_external_key === agentKey),
    ],
    [
      "POST",
      /^\/v1\/capability-grants$/,
      (user, _m, body) => {
        const grant = body.grant ?? {};
        if (
          !AGENTS.some(
            (a) => a.definition.external_key === grant.agent_external_key,
          )
        )
          fail(404, "not_found", "Agent not found");
        const connection = requireAuthorizedConnection(
          user,
          grant.connection_id,
        );
        if (
          !connection.authorized_capabilities.includes(
            grant.capability_external_key,
          )
        ) {
          fail(
            409,
            "capability_not_authorized",
            `Connection does not authorize ${grant.capability_external_key}`,
          );
        }
        const existing = user.grants.find(
          (g) =>
            g.agent_external_key === grant.agent_external_key &&
            g.connection_id === grant.connection_id &&
            g.capability_external_key === grant.capability_external_key,
        );
        if (existing) return existing;
        const created = {
          id: `grant_${randomUUID().slice(0, 8)}`,
          agent_external_key: grant.agent_external_key,
          connection_id: grant.connection_id,
          capability_external_key: grant.capability_external_key,
        };
        user.grants.push(created);
        return created;
      },
    ],
    [
      "DELETE",
      /^\/v1\/capability-grants$/,
      (user, _m, body) => {
        const grant = body.grant ?? {};
        const before = user.grants.length;
        user.grants = user.grants.filter(
          (g) =>
            !(
              g.agent_external_key === grant.agent_external_key &&
              g.connection_id === grant.connection_id &&
              g.capability_external_key === grant.capability_external_key
            ),
        );
        if (user.grants.length === before)
          fail(404, "not_found", "Grant not found");
        return undefined;
      },
    ],

    // Skills
    ["POST", /^\/v1\/skills\/list$/, (user) => user.skills.map(skillListing)],
    [
      "POST",
      /^\/v1\/skills\/private$/,
      (user, _m, body) => {
        const skill = body.skill ?? {};
        for (const field of [
          "external_key",
          "title",
          "summary",
          "instructions",
        ]) {
          if (!skill[field])
            fail(400, "invalid_request", `${field} is required`);
        }
        const version = {
          instructions: skill.instructions,
          requested_capabilities: skill.requested_capabilities ?? [],
          resources: skill.resources ?? {},
        };
        let existing = user.skills.find(
          (s) => !s.curated && s.external_key === skill.external_key,
        );
        if (existing) {
          existing.latest_version += 1;
          existing.title = skill.title;
          existing.summary = skill.summary;
          existing.versions[existing.latest_version] = {
            version: existing.latest_version,
            ...version,
          };
        } else {
          existing = {
            id: `skill_${randomUUID().slice(0, 8)}`,
            external_key: skill.external_key,
            title: skill.title,
            summary: skill.summary,
            curated: false,
            latest_version: 1,
            installed_version: null,
            enabled: false,
            update_available: false,
            owner: user.hostUserId,
            versions: { 1: { version: 1, ...version } },
          };
          user.skills.push(existing);
        }
        return skillListing(existing);
      },
    ],
    [
      "POST",
      /^\/v1\/skills\/([^/]+)\/versions\/(\d+)$/,
      (user, [, id, version]) => {
        const skill = find(user.skills, (s) => s.id === id, "Skill");
        return (
          skill.versions[Number(version)] ??
          fail(404, "not_found", "Version not found")
        );
      },
    ],
    [
      "POST",
      /^\/v1\/skills\/([^/]+)\/install$/,
      (user, [, id], body) => {
        const skill = find(user.skills, (s) => s.id === id, "Skill");
        if (body.version !== skill.latest_version) {
          fail(
            409,
            "version_changed",
            `Reviewed version ${body.version} is not the latest (${skill.latest_version})`,
          );
        }
        skill.installed_version = skill.latest_version;
        skill.enabled = true;
        return undefined;
      },
    ],
    [
      "POST",
      /^\/v1\/skills\/([^/]+)\/disable$/,
      (user, [, id]) => {
        const skill = find(user.skills, (s) => s.id === id, "Skill");
        skill.enabled = false;
        return undefined;
      },
    ],
    [
      "POST",
      /^\/v1\/agents\/([^/]+)\/effective-skills$/,
      (user, [, agentKey]) => {
        if (!AGENTS.some((a) => a.definition.external_key === agentKey))
          fail(404, "not_found", "Agent not found");
        const disabled = user.agentSkillDisabled[agentKey] ?? [];
        return user.skills
          .filter((s) => s.installed_version !== null && s.enabled)
          .filter((s) => !disabled.includes(s.id))
          .map((s) => ({ ...skillListing(s), agent_external_key: agentKey }));
      },
    ],
    [
      "POST",
      /^\/v1\/agents\/([^/]+)\/skills\/([^/]+)\/enable$/,
      (user, [, agentKey, skillId], body) => {
        if (!AGENTS.some((a) => a.definition.external_key === agentKey))
          fail(404, "not_found", "Agent not found");
        const skill = find(user.skills, (s) => s.id === skillId, "Skill");
        if (skill.installed_version === null)
          fail(409, "skill_not_installed", "Install the skill first");
        const disabled = new Set(user.agentSkillDisabled[agentKey] ?? []);
        if (body.enabled) disabled.delete(skillId);
        else disabled.add(skillId);
        user.agentSkillDisabled[agentKey] = [...disabled];
        return undefined;
      },
    ],

    // Remote extensions
    [
      "POST",
      /^\/v1\/remote-extensions\/list$/,
      (user) => user.extensions.filter((e) => e.lifecycle_state !== "removed"),
    ],
    [
      "POST",
      /^\/v1\/remote-extensions$/,
      (user, _m, body) => {
        const ext = body.extension ?? {};
        for (const field of [
          "external_key",
          "display_name",
          "endpoint_url",
          "operator",
        ]) {
          if (!ext[field]) fail(400, "invalid_request", `${field} is required`);
        }
        if (!/^https:\/\//.test(ext.endpoint_url))
          fail(422, "insecure_endpoint", "Extension endpoints must use HTTPS");
        if (
          user.extensions.some(
            (e) =>
              e.external_key === ext.external_key &&
              e.lifecycle_state !== "removed",
          )
        ) {
          fail(
            409,
            "already_installed",
            "An extension with this key is already installed",
          );
        }
        const now = iso(Date.now());
        const created = {
          id: `ext_${randomUUID().slice(0, 8)}`,
          external_key: ext.external_key,
          display_name: ext.display_name,
          protocol: ext.protocol ?? "mcp",
          endpoint_url: ext.endpoint_url,
          operator: ext.operator,
          current_version: 1,
          conformance_status: "pending",
          operator_enabled: true,
          consent_status: "consent_required",
          lifecycle_state: "installed",
          created_at: now,
          updated_at: now,
          capabilities: ext.capabilities ?? [],
        };
        user.extensions.push(created);
        return created;
      },
    ],
    [
      "POST",
      /^\/v1\/remote-extensions\/([^/]+)\/quarantine$/,
      (user, [, id]) => {
        const ext = find(user.extensions, (e) => e.id === id, "Extension");
        ext.lifecycle_state = "quarantined";
        ext.consent_status = "consent_required";
        ext.updated_at = iso(Date.now());
        return ext;
      },
    ],
    [
      "POST",
      /^\/v1\/remote-extensions\/([^/]+)$/,
      (user, [, id]) =>
        find(
          user.extensions,
          (e) => e.id === id && e.lifecycle_state !== "removed",
          "Extension",
        ),
    ],
    [
      "PUT",
      /^\/v1\/remote-extensions\/([^/]+)$/,
      (user, [, id], body) => {
        const ext = find(
          user.extensions,
          (e) => e.id === id && e.lifecycle_state !== "removed",
          "Extension",
        );
        const update = body.extension ?? {};
        if (update.endpoint_url && !/^https:\/\//.test(update.endpoint_url))
          fail(422, "insecure_endpoint", "Extension endpoints must use HTTPS");
        const materialChange =
          (update.endpoint_url && update.endpoint_url !== ext.endpoint_url) ||
          (update.capabilities &&
            stableJson(update.capabilities) !==
              stableJson(ext.capabilities ?? []));
        if (update.endpoint_url) ext.endpoint_url = update.endpoint_url;
        if (update.operator) ext.operator = update.operator;
        if (update.capabilities) ext.capabilities = update.capabilities;
        if (materialChange) {
          // Material change: new version must re-pass conformance and consent.
          ext.current_version += 1;
          ext.conformance_status = "pending";
          ext.consent_status = "consent_required";
          ext.lifecycle_state = "quarantined";
        }
        ext.updated_at = iso(Date.now());
        return ext;
      },
    ],
    [
      "DELETE",
      /^\/v1\/remote-extensions\/([^/]+)$/,
      (user, [, id]) => {
        const ext = find(
          user.extensions,
          (e) => e.id === id && e.lifecycle_state !== "removed",
          "Extension",
        );
        ext.lifecycle_state = "removed";
        ext.operator_enabled = false;
        ext.updated_at = iso(Date.now());
        return ext;
      },
    ],

    // Durable tasks
    [
      "POST",
      /^\/v1\/durable-tasks$/,
      (user, _m, body) => {
        const task = body.task ?? {};
        if (!task.title || !task.instruction)
          fail(400, "invalid_request", "title and instruction are required");
        if (
          task.agent_external_key &&
          !AGENTS.some(
            (a) => a.definition.external_key === task.agent_external_key,
          )
        ) {
          fail(404, "not_found", "Agent not found");
        }
        const now = iso(Date.now());
        const created = {
          id: `task_${randomUUID().slice(0, 12)}`,
          title: task.title,
          instruction: task.instruction,
          agent_external_key: task.agent_external_key ?? null,
          state: "queued",
          run_id: `run_${randomUUID().slice(0, 12)}`,
          wait_reason: null,
          created_at: now,
          updated_at: now,
        };
        user.tasks.push(created);
        return publicTask(created);
      },
    ],
    [
      "POST",
      /^\/v1\/durable-tasks\/([^/]+)\/cancel$/,
      (user, [, id]) => {
        const task = advanceTask(find(user.tasks, (x) => x.id === id, "Task"));
        if (["completed", "failed", "cancelled"].includes(task.state)) {
          fail(409, "task_terminal", `Task is already ${task.state}`);
        }
        task.state = "cancelled";
        task.wait_reason = null;
        task.pinned = true;
        task.updated_at = iso(Date.now());
        return publicTask(task);
      },
    ],
    [
      "POST",
      /^\/v1\/durable-tasks\/([^/]+)$/,
      (user, [, id]) =>
        publicTask(advanceTask(find(user.tasks, (x) => x.id === id, "Task"))),
    ],

    // Action proposals
    [
      "POST",
      /^\/v1\/action-proposals$/,
      (user, _m, body) => {
        const proposal = body.proposal ?? {};
        for (const field of [
          "span_id",
          "task_run_id",
          "agent_external_key",
          "capability_external_key",
          "details",
          "expires_at",
        ]) {
          if (!proposal[field])
            fail(400, "invalid_request", `${field} is required`);
        }
        if (proposal.replaces_proposal_id) {
          const replaced = find(
            user.proposals,
            (p) => p.id === proposal.replaces_proposal_id,
            "Replaced proposal",
          );
          replaced.state = "superseded";
        }
        const created = {
          id: `prop_${randomUUID().slice(0, 12)}`,
          capability_external_key: proposal.capability_external_key,
          expires_at: proposal.expires_at,
          approval_id: null,
          state: "pending",
          span_id: proposal.span_id,
          task_run_id: proposal.task_run_id,
          agent_external_key: proposal.agent_external_key,
          details: proposal.details,
        };
        user.proposals.push(created);
        return publicProposal(created);
      },
    ],
    [
      "POST",
      /^\/v1\/action-proposals\/([^/]+)\/approve$/,
      (user, [, id], body) => {
        const proposal = find(user.proposals, (p) => p.id === id, "Proposal");
        if (
          Date.parse(proposal.expires_at) < Date.now() &&
          proposal.state === "pending"
        ) {
          proposal.state = "expired";
        }
        if (proposal.state !== "pending") {
          fail(
            409,
            `proposal_${proposal.state}`,
            `Proposal is ${proposal.state}`,
          );
        }
        if (stableJson(body.details) !== stableJson(proposal.details)) {
          fail(
            409,
            "details_mismatch",
            "Approved details differ from the proposal; review the current proposal again",
          );
        }
        proposal.state = "approved";
        proposal.approval_id = `appr_${randomUUID().slice(0, 12)}`;
        const task = user.tasks.find((x) => x.run_id === proposal.task_run_id);
        if (task && task.state === "waiting_for_approval") {
          task.state = "running";
          task.wait_reason = null;
          task.updated_at = iso(Date.now());
        }
        return publicProposal(proposal);
      },
    ],

    // Connected reads
    [
      "POST",
      /^\/v1\/connected-reads\/uber$/,
      (user, _m, body) => {
        requireAuthorizedConnection(user, body.connection_id, "uber");
        requireGrant(
          user,
          body.agent_external_key ?? "saathi",
          body.connection_id,
          "uber.trips.read",
        );
        const offset = Math.max(0, Number(body.offset ?? 0));
        const limit = Math.min(50, Math.max(1, Number(body.limit ?? 10)));
        const trips = user.uberTrips
          .slice(offset, offset + limit)
          .map((trip) =>
            body.include_city === false ? { ...trip, start_city: null } : trip,
          );
        return {
          trips,
          total_trips: user.uberTrips.length,
          retrieved_at: iso(Date.now() - 42_000),
          freshness_seconds: 42,
        };
      },
    ],

    // Lodging
    [
      "POST",
      /^\/v1\/lodging\/search$/,
      (user, _m, body) => {
        // Any authorized connection owned by the user is accepted (see README).
        requireAuthorizedConnection(user, body.connection_id);
        if (!body.destination)
          fail(400, "invalid_request", "destination is required");
        const needle = String(body.destination).toLowerCase().trim();
        const properties = LODGING_PROPERTIES.filter(
          (p) =>
            p.location.toLowerCase().includes(needle) ||
            p.name.toLowerCase().includes(needle),
        );
        return { properties, total_results: properties.length };
      },
    ],
    [
      "POST",
      /^\/v1\/lodging\/bookings$/,
      (user, _m, body) => {
        requireAuthorizedConnection(user, body.connection_id);
        const request = body.booking_request ?? {};
        const property = find(
          LODGING_PROPERTIES,
          (p) => p.property_id === request.property_id,
          "Property",
        );
        const plan = find(
          property.available_rate_plans,
          (r) => r.rate_plan_id === request.rate_plan_id,
          "Rate plan",
        );
        if (!request.check_in || !request.check_out || !request.guest_name)
          fail(
            400,
            "invalid_request",
            "guest_name, check_in and check_out are required",
          );
        const nights = Math.round(
          (Date.parse(request.check_out) - Date.parse(request.check_in)) / DAY,
        );
        if (!(nights > 0))
          fail(400, "invalid_dates", "check_out must be after check_in");
        const expected = property.price_amount_minor * nights;
        if (
          request.total_amount_minor !== expected ||
          request.currency !== property.currency
        ) {
          fail(
            409,
            "price_changed",
            `Price is now ${expected} ${property.currency} minor units for ${nights} night(s); review again`,
          );
        }
        const booking = {
          booking_id: `bk_${randomUUID().slice(0, 10)}`,
          expedia_booking_ref: `EXP-${randomUUID().slice(0, 6).toUpperCase()}`,
          property_id: property.property_id,
          status: "confirmed",
          check_in: request.check_in,
          check_out: request.check_out,
          total_amount_minor: expected,
          currency: property.currency,
          cancellation_policy: plan.refundable
            ? `Free cancellation until ${plan.cancellation_deadline}.`
            : "Non-refundable: cancelling will not return any payment.",
          created_at: iso(Date.now()),
          rate_plan_id: plan.rate_plan_id,
          refundable: plan.refundable,
        };
        user.lodgingBookings.push(booking);
        return publicBooking(booking);
      },
    ],
    [
      "POST",
      /^\/v1\/lodging\/bookings\/([^/]+)\/cancel$/,
      (user, [, id], body) => {
        requireAuthorizedConnection(user, body.connection_id);
        const booking = find(
          user.lodgingBookings,
          (b) => b.booking_id === id,
          "Booking",
        );
        if (booking.status === "cancelled")
          fail(409, "already_cancelled", "Booking is already cancelled");
        booking.status = "cancelled";
        return {
          booking_id: booking.booking_id,
          expedia_booking_ref: booking.expedia_booking_ref,
          property_id: booking.property_id,
          status: "cancelled",
          refund_amount_minor: booking.refundable
            ? booking.total_amount_minor
            : 0,
          currency: booking.currency,
          cancelled_at: iso(Date.now()),
        };
      },
    ],

    // Handoffs
    [
      "POST",
      /^\/v1\/handoffs\/(amazon|zomato|uber)$/,
      (user, [, provider], body) => {
        const connection = find(
          user.connections,
          (c) => c.id === body.connection_id,
          "Connection",
        );
        if (["revoked", "cancelled"].includes(connection.authorization_state)) {
          fail(409, "connection_revoked", "Connection was disconnected");
        }
        const h = body.handoff ?? {};
        let url;
        let action;
        if (provider === "amazon") {
          if (!h.asin) fail(400, "invalid_request", "asin is required");
          action = "add_to_cart";
          url = `https://www.amazon.in/gp/aws/cart/add.html?ASIN.1=${encodeURIComponent(h.asin)}&Quantity.1=${h.quantity ?? 1}&tag=${encodeURIComponent(h.partner_tag ?? "vox-20")}`;
        } else if (provider === "zomato") {
          action = h.handoff_type ?? "ViewRestaurant";
          url = h.order_id
            ? `https://www.zomato.com/order/${encodeURIComponent(h.order_id)}/track`
            : `https://www.zomato.com/restaurant/${encodeURIComponent(h.res_id ?? "unknown")}`;
        } else {
          if (
            [
              h.pickup_latitude,
              h.pickup_longitude,
              h.dropoff_latitude,
              h.dropoff_longitude,
            ].some((v) => typeof v !== "number")
          )
            fail(
              400,
              "invalid_request",
              "pickup and dropoff coordinates are required",
            );
          action = "request_ride";
          url = `https://m.uber.com/looking?pickup[latitude]=${h.pickup_latitude}&pickup[longitude]=${h.pickup_longitude}&drop[0][latitude]=${h.dropoff_latitude}&drop[0][longitude]=${h.dropoff_longitude}`;
        }
        return {
          provider,
          action,
          handoff_url: url,
          status: "handoff_created",
          completed: false,
          disclaimer: HANDOFF_DISCLAIMER,
        };
      },
    ],

    // Reminders
    ["POST", /^\/v1\/reminders\/list$/, (user) => user.reminders],
    [
      "POST",
      /^\/v1\/reminders$/,
      (user, _m, body) => {
        for (const field of [
          "title",
          "message",
          "channel",
          "destination",
          "timezone",
          "schedule_kind",
        ]) {
          if (!body[field])
            fail(400, "invalid_request", `${field} is required`);
        }
        if (body.schedule_kind === "one_time" && !body.run_at)
          fail(
            400,
            "invalid_request",
            "run_at is required for one_time reminders",
          );
        if (body.schedule_kind === "interval" && !body.interval_seconds)
          fail(
            400,
            "invalid_request",
            "interval_seconds is required for interval reminders",
          );
        if (body.schedule_kind === "recurring" && !body.recurrence_expression)
          fail(
            400,
            "invalid_request",
            "recurrence_expression is required for recurring reminders",
          );
        const now = Date.now();
        const next =
          body.schedule_kind === "one_time"
            ? body.run_at
            : body.schedule_kind === "interval"
              ? iso(now + Number(body.interval_seconds) * 1000)
              : iso(nextLocalMorning(now, 13, 30));
        const reminder = {
          id: `rem_${randomUUID().slice(0, 10)}`,
          user_context_id: user.userContextId,
          title: body.title,
          message: body.message,
          channel: body.channel,
          destination: body.destination,
          timezone: body.timezone,
          schedule_kind: body.schedule_kind,
          run_at: body.run_at ?? null,
          interval_seconds: body.interval_seconds ?? null,
          recurrence_expression: body.recurrence_expression ?? null,
          status: "scheduled",
          max_retries: body.max_retries ?? 3,
          retry_count: 0,
          last_attempt_at: null,
          next_run_at: next,
          metadata: body.metadata ?? null,
          created_at: iso(now),
          updated_at: iso(now),
        };
        user.reminders.push(reminder);
        return reminder;
      },
    ],
    [
      "POST",
      /^\/v1\/reminders\/([^/]+)\/cancel$/,
      (user, [, id]) => {
        const reminder = find(user.reminders, (r) => r.id === id, "Reminder");
        if (reminder.status === "cancelled")
          fail(409, "already_cancelled", "Reminder is already cancelled");
        reminder.status = "cancelled";
        reminder.next_run_at = null;
        reminder.updated_at = iso(Date.now());
        return reminder;
      },
    ],
    [
      "POST",
      /^\/v1\/reminders\/([^/]+)\/deliveries$/,
      (user, [, id]) => {
        find(user.reminders, (r) => r.id === id, "Reminder");
        return user.deliveries
          .filter((d) => d.reminder_id === id)
          .sort((a, b) => b.attempted_at.localeCompare(a.attempted_at));
      },
    ],
    [
      "POST",
      /^\/v1\/reminders\/([^/]+)$/,
      (user, [, id]) => find(user.reminders, (r) => r.id === id, "Reminder"),
    ],

    // Preferences
    ["POST", /^\/v1\/preferences\/list$/, (user) => user.preferences],
    [
      "POST",
      /^\/v1\/preferences$/,
      (user, _m, body) => {
        const input = body.preference ?? {};
        if (
          !input.category ||
          !input.preference_key ||
          input.value === undefined
        )
          fail(
            400,
            "invalid_request",
            "category, preference_key and value are required",
          );
        const sensitive = input.is_sensitive === true;
        if (sensitive && input.confirmed !== true) {
          fail(
            428,
            "confirmation_required",
            "Sensitive preferences need explicit confirmation",
          );
        }
        const now = iso(Date.now());
        const existing = user.preferences.find(
          (p) => p.preference_key === input.preference_key,
        );
        if (existing) {
          existing.category = input.category;
          existing.value = input.value;
          existing.is_sensitive = sensitive || existing.is_sensitive;
          existing.confirmed_at = sensitive ? now : existing.confirmed_at;
          existing.updated_at = now;
          return existing;
        }
        const created = {
          id: `pref_${randomUUID().slice(0, 10)}`,
          user_context_id: user.userContextId,
          category: input.category,
          preference_key: input.preference_key,
          value: input.value,
          is_sensitive: sensitive,
          confirmed_at: sensitive ? now : null,
          created_at: now,
          updated_at: now,
          authority_disclaimer: PREFERENCE_DISCLAIMER,
        };
        user.preferences.push(created);
        return created;
      },
    ],
    [
      "DELETE",
      /^\/v1\/preferences\/([^/]+)$/,
      (user, [, key]) => {
        const decoded = decodeURIComponent(key);
        const before = user.preferences.length;
        user.preferences = user.preferences.filter(
          (p) => p.preference_key !== decoded && p.id !== decoded,
        );
        if (user.preferences.length === before)
          fail(404, "not_found", "Preference not found");
        return undefined;
      },
    ],

    // Privacy
    [
      "POST",
      /^\/v1\/privacy\/delete-history$/,
      (user, _m, body) => {
        const spans = user.tasks.length;
        user.tasks = [];
        user.proposals = [];
        const conversations =
          body.delete_conversations === false ? 0 : user.conversations;
        if (body.delete_conversations !== false) user.conversations = 0;
        return {
          deleted_spans_count: spans,
          deleted_conversations_count: conversations,
          disclosure: DELETION_DISCLOSURE,
        };
      },
    ],
    [
      "POST",
      /^\/v1\/privacy\/portable-export$/,
      (user, _m, body, url) => {
        const categories = Array.isArray(body.categories)
          ? body.categories
          : [];
        const exportId = `exp_${randomUUID().slice(0, 12)}`;
        const payload = {};
        if (categories.includes("preferences"))
          payload.preferences = user.preferences.map((p) => ({
            category: p.category,
            preference_key: p.preference_key,
            value: p.is_sensitive
              ? "[sensitive: exported on request only]"
              : p.value,
          }));
        if (categories.includes("config"))
          payload.config = {
            agents: AGENTS.map((a) => a.definition.external_key),
            skills: user.skills
              .filter((s) => s.installed_version !== null)
              .map((s) => ({
                external_key: s.external_key,
                version: s.installed_version,
                enabled: s.enabled,
              })),
            reminders: user.reminders.map(
              ({ id, title, schedule_kind, status }) => ({
                id,
                title,
                schedule_kind,
                status,
              }),
            ),
          };
        if (categories.includes("spans"))
          payload.spans = user.tasks.map(
            ({ id, title, state, created_at }) => ({
              id,
              title,
              state,
              created_at,
            }),
          );
        user.exports.push({ id: exportId, payload });
        return {
          export_id: exportId,
          download_url: `${url.origin}/exports/${exportId}.json`,
          categories,
          generated_at: iso(Date.now()),
          disclosure:
            "Export excludes credentials, active approvals and reusable action authority.",
        };
      },
    ],
  ];

  const allExports = () => [...users.values()].flatMap((u) => u.exports);

  async function handle(request, response) {
    const url = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? "127.0.0.1"}`,
    );
    const path = url.pathname;
    const method = request.method ?? "GET";
    const send = (status, body) => {
      response.writeHead(
        status,
        body === undefined ? {} : { "Content-Type": "application/json" },
      );
      response.end(body === undefined ? undefined : JSON.stringify(body));
    };
    try {
      if (path === "/health")
        return send(200, { status: "ok", users: users.size });

      if (path === "/__fixture/reset" && method === "POST") {
        users.clear();
        return send(200, { reset: true });
      }
      if (path === "/__fixture/state" && method === "GET") {
        return send(200, stateFor(url.searchParams.get("host_user_id")));
      }
      let m = path.match(/^\/__fixture\/connections\/([^/]+)\/state$/);
      if (m && method === "POST") {
        const body = await readJson(request);
        const results = [];
        for (const user of users.values()) {
          const c = user.connections.find((x) => x.id === m[1]);
          if (c) {
            c.authorization_state = body.authorization_state ?? "authorized";
            c.failure_code =
              c.authorization_state === "authorized" ? null : c.failure_code;
            if (c.authorization_state === "authorized")
              c.expires_at = iso(Date.now() + 30 * DAY);
            c.updated_at = iso(Date.now());
            results.push({ host_user_id: user.hostUserId, connection: c });
          }
        }
        return send(results.length ? 200 : 404, { updated: results });
      }
      m = path.match(/^\/__fixture\/tasks\/([^/]+)\/state$/);
      if (m && method === "POST") {
        const body = await readJson(request);
        const results = [];
        for (const user of users.values()) {
          const task = user.tasks.find((x) => x.id === m[1]);
          if (task) {
            task.state = body.state ?? task.state;
            task.wait_reason = body.wait_reason ?? null;
            task.pinned = true;
            task.updated_at = iso(Date.now());
            results.push(publicTask(task));
          }
        }
        return send(results.length ? 200 : 404, { updated: results });
      }
      m = path.match(/^\/exports\/([^/]+)\.json$/);
      if (m && method === "GET") {
        const found = allExports().find((e) => e.id === m[1]);
        return found
          ? send(200, found.payload)
          : send(404, { error: "not_found" });
      }

      if (!path.startsWith("/v1/")) return send(404, { error: "not_found" });

      if (!request.headers["x-vox-host-credential"]) {
        fail(401, "host_assertion_missing", "Missing X-Vox-Host-Credential");
      }
      const route = routes.find(
        ([routeMethod, pattern]) =>
          routeMethod === method && pattern.test(path),
      );
      if (!route) {
        log(`unhandled ${method} ${path}`);
        fail(
          404,
          "route_not_found",
          `Core fixture does not implement ${method} ${path}`,
        );
      }
      const body = await readJson(request);
      const hostUserId = body.host_context?.host_user_id ?? body.host_user_id;
      const user = stateFor(hostUserId);
      const match = path
        .match(route[1])
        .map((part, index) => (index === 0 ? part : decodeURIComponent(part)));
      const result = route[2](user, match, body, url);
      log(`${method} ${path} -> ${result === undefined ? 204 : 200}`);
      return result === undefined ? send(204) : send(200, result);
    } catch (error) {
      if (error instanceof HttpError) {
        log(`${method} ${path} -> ${error.status} ${error.code}`);
        return send(error.status, {
          error: error.code,
          message: error.message,
        });
      }
      console.error("[fixture-core]", error);
      return send(500, { error: "fixture_error", message: String(error) });
    }
  }

  return { handle, users };
}

/** Start the mock Core server. Resolves with the http.Server. */
export function startCore({
  port = Number(process.env.CONSUMER_FIXTURE_CORE_PORT ?? DEFAULT_CORE_PORT),
  host = "127.0.0.1",
} = {}) {
  const fixture = createCoreFixture();
  const server = createServer((request, response) => {
    fixture.handle(request, response);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      log(`listening on http://${host}:${port}`);
      resolve(server);
    });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const portFlag = process.argv.indexOf("--port");
  startCore(
    portFlag > 0 ? { port: Number(process.argv[portFlag + 1]) } : {},
  ).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
