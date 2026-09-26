import assert from "node:assert/strict";
import test from "node:test";
import { VoxCoreHostClient } from "../src/lib/consumer-auth/core-host-client";
import { DELETION_DISCLOSURE } from "../src/lib/consumer-auth/constants";

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
  preference?: {
    category: string;
    preference_key: string;
    value: unknown;
    is_sensitive?: boolean | null;
    confirmed?: boolean | null;
  };
  delete_conversations?: boolean;
  categories?: string[];
  [key: string]: unknown;
};

test("listPreferences posts signed host context to /v1/preferences/list", async () => {
  let capturedUrl = "";
  let capturedBody: MockRequestBody = {};

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      return Response.json([
        {
          id: "pref-1",
          user_context_id: "ctx-1",
          category: "locale",
          preference_key: "display_currency",
          value: "EUR",
          is_sensitive: false,
          confirmed_at: null,
          created_at: "2026-09-24T00:00:00Z",
          updated_at: "2026-09-24T00:00:00Z",
          authority_disclaimer: "User preference is advisory context only.",
        },
      ]);
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-pref-1",
  });

  const prefs = await client.listPreferences("user-1");
  assert.equal(capturedUrl, "https://core.vox.test/v1/preferences/list");
  assert.equal(capturedBody?.host_context?.host_user_id, "vox-account:user-1");
  assert.equal(prefs.length, 1);
  assert.equal(prefs[0].preference_key, "display_currency");
  assert.equal(prefs[0].value, "EUR");
});

test("setPreference posts preference payload and enforces advisory authority", async () => {
  let capturedUrl = "";
  let capturedBody: MockRequestBody = {};

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      return Response.json({
        id: "pref-2",
        user_context_id: "ctx-1",
        category: "dining",
        preference_key: "dietary_preferences",
        value: ["vegetarian"],
        is_sensitive: false,
        confirmed_at: null,
        created_at: "2026-09-24T00:00:00Z",
        updated_at: "2026-09-24T00:00:00Z",
        authority_disclaimer: "User preference is advisory context only.",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-pref-2",
  });

  const created = await client.setPreference("user-1", {
    category: "dining",
    preference_key: "dietary_preferences",
    value: ["vegetarian"],
    is_sensitive: false,
    confirmed: false,
  });

  assert.equal(capturedUrl, "https://core.vox.test/v1/preferences");
  assert.equal(capturedBody?.preference?.preference_key, "dietary_preferences");
  assert.equal(created.id, "pref-2");
});

test("deletePreference executes DELETE on /v1/preferences/{key}", async () => {
  let capturedUrl = "";
  let capturedMethod = "";

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedMethod = init?.method || "GET";
      return new Response(null, { status: 204 });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-pref-3",
  });

  await client.deletePreference("user-1", "display_currency");
  assert.equal(
    capturedUrl,
    "https://core.vox.test/v1/preferences/display_currency",
  );
  assert.equal(capturedMethod, "DELETE");
});

test("deleteTaskHistory posts to /v1/privacy/delete-history and verifies disclosure", async () => {
  let capturedUrl = "";
  let capturedBody: MockRequestBody = {};

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      return Response.json({
        deleted_spans_count: 5,
        deleted_conversations_count: 12,
        disclosure: DELETION_DISCLOSURE,
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-pref-4",
  });

  const result = await client.deleteTaskHistory("user-1", true);
  assert.equal(capturedUrl, "https://core.vox.test/v1/privacy/delete-history");
  assert.equal(capturedBody?.delete_conversations, true);
  assert.equal(result.deleted_spans_count, 5);
  assert.equal(result.deleted_conversations_count, 12);
});

test("deletion disclosure invariant: explicitly identifies external records, backups, and no undo", () => {
  // PRD FR-DAT-006 & FR-DAT-007 verification
  assert.ok(
    DELETION_DISCLOSURE.includes(
      "DOES NOT undo, cancel, or refund completed external transactions",
    ),
    "Must state that deleting history does not undo completed external transactions",
  );
  assert.ok(
    DELETION_DISCLOSURE.includes("External service records"),
    "Must disclose third-party external service records",
  );
  assert.ok(
    DELETION_DISCLOSURE.includes("remote operator"),
    "Must disclose remote operator systems",
  );
  assert.ok(
    DELETION_DISCLOSURE.includes("audit hold retention"),
    "Must disclose mandatory audit retention",
  );
  assert.ok(
    DELETION_DISCLOSURE.includes("backups"),
    "Must disclose backup timing and rolling expiration",
  );
});

test("portable export request excludes credentials and active authority", async () => {
  let capturedUrl = "";
  let capturedBody: MockRequestBody = {};

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      return Response.json({
        export_id: "exp-999",
        download_url: "https://core.vox.test/downloads/exp-999.json",
        categories: ["preferences", "config"],
        generated_at: "2026-09-24T08:00:00Z",
        disclosure:
          "Non-secret export excluding credentials and active authority",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-pref-5",
  });

  const result = await client.requestPortableExport("user-1", [
    "preferences",
    "config",
  ]);
  assert.equal(capturedUrl, "https://core.vox.test/v1/privacy/portable-export");
  assert.deepEqual(capturedBody?.categories, ["preferences", "config"]);
  assert.equal(result.export_id, "exp-999");
});
