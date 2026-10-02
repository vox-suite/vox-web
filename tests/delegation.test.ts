import assert from "node:assert/strict";
import test from "node:test";
import { validPermission } from "../src/features/delegation/validation";
import { VoxCoreHostClient } from "../src/lib/consumer-auth/core-host-client";
const cap = {
  connection_id: "aaaaaaaa-1111-4111-8111-111111111111",
  capability_external_key: "calendar.events.write",
};
const input = {
  requester_agent_key: "general",
  specialist_agent_key: "concierge",
  scope: { capabilities: [cap] },
  parent_run_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  preference_keys: ["seat_preference"],
};
test("delegation accepts named references and once/remembered consent, rejects client authority and unbounded scopes", () => {
  assert.equal(validPermission(input), true);
  assert.equal(validPermission({ ...input, parent_run_id: null }), true);
  for (const invalid of [
    { ...input, specialist_agent_key: "general" },
    {
      ...input,
      scope: {
        capabilities: [{ ...cap, declaration_digest: "client-authority" }],
      },
    },
    { ...input, scope: { capabilities: [cap], skills: [] } },
    { ...input, scope: { capabilities: [] } },
    { ...input, scope: { capabilities: [cap, cap] } },
    { ...input, parent_run_id: "other-context" },
    { ...input, preference_keys: ["🚀".repeat(33)] },
    { ...input, preference_keys: ["seat_preference", "seat_preference"] },
    { ...input, account_id: "other-user" },
  ])
    assert.equal(validPermission(invalid), false);
});
test("delegation and stop-all use authenticated host context and leave capability digests to Core", async () => {
  const requests: Array<{
    url: string;
    body: Record<string, unknown>;
    headers: Headers;
  }> = [];
  const client = new VoxCoreHostClient(
    {
      baseUrl: "https://core.example",
      hostCredential: {
        credentialId: "host",
        audience: "vox-host:test",
        secret: "test-secret",
      },
    },
    {
      fetch: async (url, init) => {
        requests.push({
          url: String(url),
          body: JSON.parse(String(init?.body)),
          headers: new Headers(init?.headers),
        });
        return String(url).endsWith("revoke")
          ? new Response(null, { status: 204 })
          : Response.json(
              String(url).endsWith("stop-all")
                ? { cancelled: 2, undo: false }
                : { id: "permission" },
            );
      },
      now: () => 1,
      nonce: () => "test-nonce",
    },
  );
  await client.createDelegationPermission("owner", input);
  await client.delegationScopes("owner", "general", "concierge");
  await client.listDelegationPermissions("owner");
  await client.revokeDelegationPermission("owner", "permission");
  assert.deepEqual(await client.stopAllTasks("owner"), {
    cancelled: 2,
    undo: false,
  });
  assert.deepEqual(
    requests.map((request) => new URL(request.url).pathname),
    [
      "/v1/delegation-permissions",
      "/v1/delegation-scopes",
      "/v1/delegation-permissions/query",
      "/v1/delegation-permissions/permission/revoke",
      "/v1/durable-tasks/stop-all",
    ],
  );
  for (const request of requests) {
    assert.deepEqual(request.body.host_context, {
      host_user_id: "vox-account:owner",
      organization_external_key: null,
    });
    assert.ok(request.headers.get("X-Vox-Host-Signature"));
  }
  assert.deepEqual(requests[0].body.permission, input);
  assert.equal(JSON.stringify(requests[0].body).includes("digest"), false);
});
