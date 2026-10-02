import assert from "node:assert/strict";
import test from "node:test";
import {
  createHostAssertion,
  VoxCoreHostClient,
} from "../src/lib/consumer-auth/core-host-client";

test("Core host assertions match the accepted canonical signing vector", () => {
  const assertion = createHostAssertion(
    {
      credentialId: "11111111-2222-4333-8444-555555555555",
      audience: "vox-host:production:vox-web",
      secret: "host-secret-fixture",
    },
    {
      hostUserId: "vox-account:aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      organizationExternalKey: null,
    },
    {
      issuedAtSeconds: 1_795_622_400,
      nonce: "99999999-8888-4777-8666-555555555555",
    },
  );

  assert.deepEqual(assertion.headers, {
    "X-Vox-Host-Credential": "11111111-2222-4333-8444-555555555555",
    "X-Vox-Host-Secret": "host-secret-fixture",
    "X-Vox-Host-Audience": "vox-host:production:vox-web",
    "X-Vox-Host-Timestamp": "1795622400",
    "X-Vox-Host-Nonce": "99999999-8888-4777-8666-555555555555",
    "X-Vox-Host-Signature":
      "8970b0afe75d8e5924b1f0987bdaa428e6481c2ed6bd3ee3ba85596606d20e33",
  });
});

test("agent management signs the authenticated account context and carries the edit version", async () => {
  let captured: { url: string; init: RequestInit } | undefined;
  const client = new VoxCoreHostClient(
    {
      baseUrl: "https://core.vox.test",
      hostCredential: {
        credentialId: "11111111-2222-4333-8444-555555555555",
        audience: "vox-host:test:vox-web",
        secret: "host-secret-fixture",
      },
    },
    {
      fetch: async (input, init) => {
        captured = { url: String(input), init: init ?? {} };
        return new Response(null, { status: 204 });
      },
      now: () => 1_795_622_400,
      nonce: () => "99999999-8888-4777-8666-555555555555",
    },
  );
  await client.manageAgent("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", {
    operation: "update",
    agent_key: "owned-specialist",
    name: "Engineering",
    instructions: "Review source code",
    expected_version: 3,
  });
  assert.equal(captured?.url, "https://core.vox.test/v1/agents/manage");
  const body = JSON.parse(String(captured?.init.body));
  assert.equal(
    body.host_context.host_user_id,
    "vox-account:aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  );
  assert.equal(body.mutation.expected_version, 3);
  assert.equal(
    (captured?.init.headers as Record<string, string>)["X-Vox-Host-Credential"],
    "11111111-2222-4333-8444-555555555555",
  );
});
