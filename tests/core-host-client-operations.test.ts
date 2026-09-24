import assert from "node:assert/strict";
import test from "node:test";
import { VoxCoreHostClient } from "../src/lib/consumer-auth/core-host-client";

function get(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (o, k) => (o as Record<string, unknown> | undefined)?.[k],
      obj,
    );
}

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
  let capturedBody: unknown = null;
  let capturedHeaders: unknown = null;

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
  assert.equal(get(capturedBody, "host_context.host_user_id"), "vox-account:user-1");
  assert.equal(get(capturedHeaders, "X-Vox-Host-Credential"), "11111111-2222-4333-8444-555555555555");
  assert.equal(connections.length, 1);
  assert.equal(connections[0].account_display_id, "alex@example.test");
  assert.equal(connections[0].credential_custody, "external_operator");
});

test("initiateConnection returns authorization challenge and url", async () => {
  let capturedUrl = "";
  let capturedBody: unknown = null;

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
  assert.equal(get(capturedBody, "initiation.integration_external_key"), "google-calendar");
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

test("action proposal creation and exact-match approval call Core endpoints", async () => {
  let capturedProposalUrl = "";
  let capturedApproveUrl = "";
  let capturedApproveBody: unknown = null;

  const client = new VoxCoreHostClient(testConfig, {
    fetch: async (input, init) => {
      const url = String(input);
      const body = JSON.parse(String(init?.body || "{}"));
      if (url.endsWith("/v1/action-proposals")) {
        capturedProposalUrl = url;
        return Response.json({
          id: "prop-123",
          capability_external_key: "travel.book",
          expires_at: "2026-09-24T00:00:00Z",
          approval_id: null,
          state: "pending",
          details: body.proposal.details,
        }, { status: 201 });
      }
      if (url.endsWith("/approve")) {
        capturedApproveUrl = url;
        capturedApproveBody = body;
        return Response.json({
          id: "prop-123",
          capability_external_key: "travel.book",
          expires_at: "2026-09-24T00:00:00Z",
          approval_id: "appr-456",
          state: "approved",
          details: body.details,
        });
      }
      return new Response("Not found", { status: 404 });
    },
    now: () => 1_795_622_400,
    nonce: () => "mock-nonce-6",
  });

  const proposal = await client.createProposal("user-1", {
    task_id: "task-1",
    task_run_id: "run-1",
    agent_external_key: "planner",
    capability_external_key: "travel.book",
    details: {
      title: "Flight Booking BLR to DEL",
      provider: "Indigo Airlines",
      price: 4500,
      currency: "INR",
      fees: 250,
      data_recipients: ["airline.api"],
    },
    expires_at: "2026-09-24T00:00:00Z",
  });

  assert.equal(capturedProposalUrl, "https://core.vox.test/v1/action-proposals");
  assert.equal(proposal.id, "prop-123");
  assert.equal(proposal.details.title, "Flight Booking BLR to DEL");

  const approved = await client.approveProposal("user-1", "prop-123", proposal.details);
  assert.equal(capturedApproveUrl, "https://core.vox.test/v1/action-proposals/prop-123/approve");
  assert.equal(approved.state, "approved");
  assert.equal(approved.approval_id, "appr-456");
  assert.deepEqual(get(capturedApproveBody, "details"), proposal.details);
});
