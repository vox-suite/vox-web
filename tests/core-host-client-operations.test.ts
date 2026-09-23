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

test("listConnections posts signed host context and parses connection list", async () => {
  let capturedUrl = "";
  let capturedBody: any = null;
  let capturedHeaders: any = null;

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      capturedHeaders = init?.headers;
      return Response.json([
        {
          id: "conn-123",
          integration_external_key: "google-calendar",
          external_account_reference: "alex@example.test",
          account_display_id: "alex@example.test",
          credential_custody: "external_operator",
          authorization_state: "authorized",
          authorized_capabilities: ["calendar.read"],
          expires_at: null,
          failure_code: null,
          created_at: "2026-09-23T00:00:00Z",
          updated_at: "2026-09-23T00:00:00Z",
        },
      ]);
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-1",
  });

  const connections = await client.listConnections("user-1");
  assert.equal(capturedUrl, "https://core.vox.test/v1/connections/list");
  assert.equal(capturedBody.host_context.host_user_id, "vox-account:user-1");
  assert.equal(capturedHeaders["X-Vox-Host-Credential"], "11111111-2222-4333-8444-555555555555");
  assert.equal(connections.length, 1);
  assert.equal(connections[0].account_display_id, "alex@example.test");
  assert.equal(connections[0].credential_custody, "external_operator");
});

test("initiateConnection returns authorization challenge and url", async () => {
  let capturedUrl = "";
  let capturedBody: any = null;

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse(String(init?.body));
      return Response.json({
        session_id: "sess-abc",
        integration_external_key: "google-calendar",
        state_token: "state-token-xyz",
        authorization_url: "https://accounts.google.com/o/oauth2/auth?state=state-token-xyz",
        expires_at: "2026-09-23T01:00:00Z",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-2",
  });

  const res = await client.initiateConnection("user-1", {
    integration_external_key: "google-calendar",
    credential_custody: "external_operator",
    requested_capabilities: ["calendar.read"],
    redirect_uri: "https://app.voxagent.in/api/account/connections/callback",
  });

  assert.equal(capturedUrl, "https://core.vox.test/v1/connections/initiate");
  assert.equal(capturedBody.initiation.integration_external_key, "google-calendar");
  assert.equal(res.session_id, "sess-abc");
  assert.equal(res.state_token, "state-token-xyz");
});

test("disconnectConnection calls Core disconnect endpoint and revokes connection", async () => {
  let capturedUrl = "";

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input) => {
      capturedUrl = String(input);
      return Response.json({
        id: "conn-123",
        integration_external_key: "google-calendar",
        external_account_reference: "alex@example.test",
        account_display_id: "alex@example.test",
        credential_custody: "external_operator",
        authorization_state: "revoked",
        authorized_capabilities: [],
        expires_at: null,
        failure_code: null,
        created_at: "2026-09-23T00:00:00Z",
        updated_at: "2026-09-23T01:00:00Z",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-3",
  });

  const res = await client.disconnectConnection("user-1", "conn-123");
  assert.equal(capturedUrl, "https://core.vox.test/v1/connections/conn-123/disconnect");
  assert.equal(res.authorization_state, "revoked");
});

test("effective grants and grant management call Core endpoints", async () => {
  let capturedEffectiveUrl = "";
  let capturedGrantUrl = "";
  let capturedRevokeMethod = "";

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      const url = String(input);
      if (url.includes("/effective-capability-grants")) {
        capturedEffectiveUrl = url;
        return Response.json([
          {
            id: "grant-1",
            agent_external_key: "saathi",
            connection_id: "conn-123",
            capability_external_key: "calendar.read",
          },
        ]);
      }
      if (init?.method === "POST" && url.includes("/v1/capability-grants")) {
        capturedGrantUrl = url;
        return Response.json({
          id: "grant-1",
          agent_external_key: "saathi",
          connection_id: "conn-123",
          capability_external_key: "calendar.read",
        });
      }
      if (init?.method === "DELETE" && url.includes("/v1/capability-grants")) {
        capturedRevokeMethod = "DELETE";
        return new Response(null, { status: 204 });
      }
      return Response.json({});
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-4",
  });

  const grants = await client.listEffectiveGrants("user-1", "saathi");
  assert.equal(
    capturedEffectiveUrl,
    "https://core.vox.test/v1/agents/saathi/effective-capability-grants",
  );
  assert.equal(grants.length, 1);
  assert.equal(grants[0].capability_external_key, "calendar.read");

  const created = await client.createGrant("user-1", {
    agent_external_key: "saathi",
    connection_id: "conn-123",
    capability_external_key: "calendar.read",
  });
  assert.equal(capturedGrantUrl, "https://core.vox.test/v1/capability-grants");
  assert.equal(created.id, "grant-1");

  await client.revokeGrant("user-1", {
    agent_external_key: "saathi",
    connection_id: "conn-123",
    capability_external_key: "calendar.read",
  });
  assert.equal(capturedRevokeMethod, "DELETE");
});

test("durable task start, get, and cancel call Core endpoints", async () => {
  let capturedStartUrl = "";
  let capturedGetUrl = "";
  let capturedCancelUrl = "";

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input) => {
      const url = String(input);
      if (url.endsWith("/durable-tasks")) {
        capturedStartUrl = url;
        return Response.json({
          id: "task-999",
          title: "Book dinner",
          instruction: "Table for 2",
          agent_external_key: "saathi",
          state: "running",
          run_id: "run-1",
          created_at: "2026-09-23T00:00:00Z",
          updated_at: "2026-09-23T00:00:00Z",
        });
      }
      if (url.endsWith("/cancel")) {
        capturedCancelUrl = url;
        return Response.json({
          id: "task-999",
          title: "Book dinner",
          instruction: "Table for 2",
          agent_external_key: "saathi",
          state: "cancelled",
          run_id: "run-1",
          created_at: "2026-09-23T00:00:00Z",
          updated_at: "2026-09-23T00:05:00Z",
        });
      }
      capturedGetUrl = url;
      return Response.json({
        id: "task-999",
        title: "Book dinner",
        instruction: "Table for 2",
        agent_external_key: "saathi",
        state: "waiting_for_approval",
        run_id: "run-1",
        wait_reason: "User confirmation required for dinner booking",
        created_at: "2026-09-23T00:00:00Z",
        updated_at: "2026-09-23T00:02:00Z",
      });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-5",
  });

  const task = await client.startTask("user-1", {
    title: "Book dinner",
    instruction: "Table for 2",
    agent_external_key: "saathi",
  });
  assert.equal(capturedStartUrl, "https://core.vox.test/v1/durable-tasks");
  assert.equal(task.id, "task-999");
  assert.equal(task.state, "running");

  const polled = await client.getTask("user-1", "task-999");
  assert.equal(capturedGetUrl, "https://core.vox.test/v1/durable-tasks/task-999");
  assert.equal(polled.state, "waiting_for_approval");
  assert.equal(polled.wait_reason, "User confirmation required for dinner booking");

  const cancelled = await client.cancelTask("user-1", "task-999");
  assert.equal(capturedCancelUrl, "https://core.vox.test/v1/durable-tasks/task-999/cancel");
  assert.equal(cancelled.state, "cancelled");
});
