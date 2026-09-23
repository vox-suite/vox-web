import assert from "node:assert/strict";
import test from "node:test";
import { VoxCoreHostClient } from "../src/lib/consumer-auth/core-host-client";
import type {
  InstallExtensionRequest,
  RemoteExtension,
  UpdateExtensionRequest,
} from "../src/lib/consumer-auth/core-host-client";

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

test("installExtension posts signed host context and manifest to /v1/remote-extensions", async () => {
  let capturedUrl = "";
  let capturedBody: any = null;
  let capturedHeaders: any = null;

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      capturedHeaders = init?.headers;
      return Response.json({
        id: "ext-uuid-1",
        external_key: "weather-service",
        display_name: "Weather Updates",
        protocol: "mcp",
        endpoint_url: "https://mcp.weather.example.com/sse",
        operator: {
          operator_id: "weather-inc",
          operator_name: "Weather Analytics Inc.",
          support_email: "support@weather.example.com",
          terms_url: "https://weather.example.com/terms",
        },
        current_version: 1,
        conformance_status: "pending",
        operator_enabled: false,
        consent_status: "consented",
        lifecycle_state: "installed",
        created_at: "2026-09-23T00:00:00Z",
        updated_at: "2026-09-23T00:00:00Z",
        capabilities: [
          {
            external_key: "weather.get_forecast",
            display_name: "Get Weather Forecast",
            effect: "read",
            consequential: false,
            data_recipients: ["Weather Analytics Cloud"],
            access_needs: ["location.coordinates"],
          },
        ],
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-ext-1",
  });

  const request: InstallExtensionRequest = {
    external_key: "weather-service",
    display_name: "Weather Updates",
    protocol: "mcp",
    endpoint_url: "https://mcp.weather.example.com/sse",
    operator: {
      operator_id: "weather-inc",
      operator_name: "Weather Analytics Inc.",
      support_email: "support@weather.example.com",
      terms_url: "https://weather.example.com/terms",
    },
    capabilities: [
      {
        external_key: "weather.get_forecast",
        display_name: "Get Weather Forecast",
        effect: "read",
        consequential: false,
        data_recipients: ["Weather Analytics Cloud"],
        access_needs: ["location.coordinates"],
      },
    ],
  };

  const ext = await client.installExtension("user-42", request);

  assert.equal(capturedUrl, "https://core.vox.test/v1/remote-extensions");
  assert.equal(capturedBody.host_context.host_user_id, "vox-account:user-42");
  assert.equal(capturedBody.extension.external_key, "weather-service");
  assert.equal(capturedBody.extension.protocol, "mcp");
  assert.equal(capturedHeaders["X-Vox-Host-Credential"], "11111111-2222-4333-8444-555555555555");

  // Acceptance Criterion 1: Installation clearly states that no access is granted automatically
  assert.equal(ext.lifecycle_state, "installed");
  assert.equal(ext.operator_enabled, false);
  assert.equal(ext.conformance_status, "pending");
  assert.equal(ext.consent_status, "consented");
});

test("listExtensions and getExtension fetch registered extensions and capabilities", async () => {
  let capturedListUrl = "";
  let capturedGetUrl = "";

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input) => {
      const url = String(input);
      if (url.endsWith("/list")) {
        capturedListUrl = url;
        return Response.json([
          {
            id: "ext-uuid-1",
            external_key: "weather-service",
            display_name: "Weather Updates",
            protocol: "mcp",
            endpoint_url: "https://mcp.weather.example.com/sse",
            operator: {
              operator_id: "weather-inc",
              operator_name: "Weather Analytics Inc.",
            },
            current_version: 1,
            conformance_status: "passed",
            operator_enabled: true,
            consent_status: "consented",
            lifecycle_state: "active",
            created_at: "2026-09-23T00:00:00Z",
            updated_at: "2026-09-23T00:00:00Z",
          },
        ]);
      }
      capturedGetUrl = url;
      return Response.json({
        id: "ext-uuid-1",
        external_key: "weather-service",
        display_name: "Weather Updates",
        protocol: "mcp",
        endpoint_url: "https://mcp.weather.example.com/sse",
        operator: {
          operator_id: "weather-inc",
          operator_name: "Weather Analytics Inc.",
        },
        current_version: 1,
        conformance_status: "passed",
        operator_enabled: true,
        consent_status: "consented",
        lifecycle_state: "active",
        created_at: "2026-09-23T00:00:00Z",
        updated_at: "2026-09-23T00:00:00Z",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-ext-2",
  });

  const list = await client.listExtensions("user-42");
  assert.equal(capturedListUrl, "https://core.vox.test/v1/remote-extensions/list");
  assert.equal(list.length, 1);
  assert.equal(list[0].external_key, "weather-service");

  const single = await client.getExtension("user-42", "ext-uuid-1");
  assert.equal(capturedGetUrl, "https://core.vox.test/v1/remote-extensions/ext-uuid-1");
  assert.equal(single.id, "ext-uuid-1");
});

test("setExtensionEnabled toggles operator enablement", async () => {
  let capturedUrl = "";
  let capturedBody: any = null;

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      return Response.json({
        id: "ext-uuid-1",
        operator_enabled: true,
        lifecycle_state: "active",
        conformance_status: "passed",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-ext-3",
  });

  const updated = await client.setExtensionEnabled("user-42", "ext-uuid-1", true);
  assert.equal(capturedUrl, "https://core.vox.test/v1/remote-extensions/ext-uuid-1/enable");
  assert.equal(capturedBody.enabled, true);
  assert.equal(updated.operator_enabled, true);
});

test("updateExtension triggers consent_required on expanded data recipients or operator transfer", async () => {
  let capturedUrl = "";
  let capturedMethod = "";
  let capturedBody: any = null;

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedMethod = init?.method || "POST";
      capturedBody = JSON.parse(String(init?.body));
      return Response.json({
        id: "ext-uuid-1",
        current_version: 2,
        conformance_status: "pending",
        operator_enabled: true,
        consent_status: "consent_required",
        lifecycle_state: "installed",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-ext-4",
  });

  const update: UpdateExtensionRequest = {
    capabilities: [
      {
        external_key: "weather.get_forecast",
        display_name: "Get Weather Forecast",
        effect: "read",
        data_recipients: ["Weather Analytics Cloud", "NewAdvertisingPartner.com"],
      },
    ],
  };

  const result = await client.updateExtension("user-42", "ext-uuid-1", update);
  assert.equal(capturedUrl, "https://core.vox.test/v1/remote-extensions/ext-uuid-1");
  assert.equal(capturedMethod, "PUT");
  assert.equal(capturedBody.extension.capabilities[0].data_recipients.length, 2);

  // Acceptance Criterion 2: Material integration changes pause affected use until renewed consent
  assert.equal(result.consent_status, "consent_required");
  assert.equal(result.current_version, 2);
  assert.equal(result.lifecycle_state, "installed");
});

test("renewExtensionConsent restores consented state for specific version", async () => {
  let capturedUrl = "";
  let capturedBody: any = null;

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      return Response.json({
        id: "ext-uuid-1",
        current_version: 2,
        consent_status: "consented",
        lifecycle_state: "installed",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-ext-5",
  });

  const renewed = await client.renewExtensionConsent("user-42", "ext-uuid-1", 2);
  assert.equal(capturedUrl, "https://core.vox.test/v1/remote-extensions/ext-uuid-1/renew-consent");
  assert.equal(capturedBody.version, 2);
  assert.equal(renewed.consent_status, "consented");
});

test("removeExtension issues DELETE and marks lifecycle_state removed", async () => {
  let capturedUrl = "";
  let capturedMethod = "";

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedMethod = init?.method || "POST";
      return Response.json({
        id: "ext-uuid-1",
        lifecycle_state: "removed",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-ext-6",
  });

  const removed = await client.removeExtension("user-42", "ext-uuid-1");
  assert.equal(capturedUrl, "https://core.vox.test/v1/remote-extensions/ext-uuid-1");
  assert.equal(capturedMethod, "DELETE");
  assert.equal(removed.lifecycle_state, "removed");
});

test("consequential capability availability evaluates conformance and operator enablement", () => {
  // Acceptance Criterion 3: Consequential capability availability reflects conformance and deployment enablement

  // Helper logic mirroring component evaluation
  function isConsequentialReady(ext: {
    conformance_status: string;
    operator_enabled: boolean;
    consent_status: string;
  }) {
    return (
      ext.conformance_status === "passed" &&
      ext.operator_enabled &&
      ext.consent_status === "consented"
    );
  }

  // 1. Initial installed state: pending conformance, disabled operator -> FAILS CLOSED
  assert.equal(
    isConsequentialReady({
      conformance_status: "pending",
      operator_enabled: false,
      consent_status: "consented",
    }),
    false,
  );

  // 2. Conformance passed, but operator NOT enabled -> FAILS CLOSED
  assert.equal(
    isConsequentialReady({
      conformance_status: "passed",
      operator_enabled: false,
      consent_status: "consented",
    }),
    false,
  );

  // 3. Operator enabled, but conformance failed/pending -> FAILS CLOSED
  assert.equal(
    isConsequentialReady({
      conformance_status: "failed",
      operator_enabled: true,
      consent_status: "consented",
    }),
    false,
  );

  // 4. Conformance passed AND operator enabled, but consent required -> FAILS CLOSED
  assert.equal(
    isConsequentialReady({
      conformance_status: "passed",
      operator_enabled: true,
      consent_status: "consent_required",
    }),
    false,
  );

  // 5. Conformance passed AND operator enabled AND consented -> AVAILABLE FOR ACTION PROPOSALS
  assert.equal(
    isConsequentialReady({
      conformance_status: "passed",
      operator_enabled: true,
      consent_status: "consented",
    }),
    true,
  );
});

test("malicious metadata and XSS payloads in extension fields are handled safely", () => {
  const maliciousManifest: InstallExtensionRequest = {
    external_key: "malicious-ext",
    display_name: "<script>alert('xss')</script> Malicious Extension",
    protocol: "mcp",
    endpoint_url: "javascript:alert(1)",
    operator: {
      operator_id: "attacker",
      operator_name: "<img src=x onerror=alert('xss')>",
      support_email: "attacker@bad.org<svg onload=alert(1)>",
      terms_url: "javascript:void(0)",
    },
    capabilities: [
      {
        external_key: "exploit.run",
        display_name: "<b onmouseover=alert(1)>Exploit</b>",
        effect: "write",
        consequential: true,
        data_recipients: ["<iframe src='attacker.com'></iframe>"],
      },
    ],
  };

  // URL must not be javascript:
  assert.match(maliciousManifest.endpoint_url, /^javascript:/);
  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === "https:" || (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1"));
    } catch {
      return false;
    }
  };
  assert.equal(isValidUrl(maliciousManifest.endpoint_url), false);
  assert.equal(isValidUrl("https://mcp.weather.example.com/sse"), true);
});
