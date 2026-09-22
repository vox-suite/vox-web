import assert from "node:assert/strict";
import test from "node:test";
import {
  createFederatedProof,
  createHostAssertion,
  VoxCoreHostClient,
} from "../src/lib/consumer-auth/core-host-client";

const privateKey =
  "MC4CAQAwBQYDK2VwBCIEIBERERERERERERERERERERERERERERERERERERERERER";

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

test("federated assertions match the accepted Ed25519 proof vocabulary", () => {
  const proof = createFederatedProof(
    {
      issuer: "https://app.voxagent.in",
      audience: "vox-core:production",
      privateKeyPkcs8Base64: privateKey,
    },
    "vox-account:aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    {
      issuedAtSeconds: 1_795_622_400,
      expiresAtSeconds: 1_795_622_700,
      nonce: "77777777-6666-4555-8444-333333333333",
    },
  );

  assert.equal(proof.issuer, "https://app.voxagent.in");
  assert.equal(proof.audience, "vox-core:production");
  assert.equal(
    proof.subject,
    "vox-account:aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  );
  assert.equal(proof.issued_at, 1_795_622_400);
  assert.equal(proof.expires_at, 1_795_622_700);
  assert.equal(proof.nonce, "77777777-6666-4555-8444-333333333333");
  assert.equal(
    proof.signature,
    "51d994c0191d73cd2cb8a37ba4846d99a8c9b12f4b32f9046825cb09c2c0334bcf5368075fef992186632b088db70584506a02ac640988bb65f30e9225e8610a",
  );
});

test("consumer authentication resolves one Core context without exposing the one-time token", async () => {
  let captured: { url: string; init: RequestInit } | undefined;
  const client = new VoxCoreHostClient(
    {
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
    },
    {
      fetch: async (input, init) => {
        captured = { url: String(input), init: init ?? {} };
        return Response.json({
          user_context_id: "22222222-3333-4444-8555-666666666666",
          adapter_external_key: "vox-web-primary",
          expires_at: "2026-11-25T00:05:00Z",
          authentication_token: "must-not-escape-the-client",
        });
      },
      now: () => 1_795_622_400,
      nonce: () => "99999999-8888-4777-8666-555555555555",
    },
  );

  const result = await client.authenticateAccount(
    "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  );

  assert.deepEqual(result, {
    userContextId: "22222222-3333-4444-8555-666666666666",
  });
  assert.equal(
    captured?.url,
    "https://core.vox.test/v1/identity/authentications",
  );
  const body = JSON.parse(String(captured?.init.body));
  assert.equal(
    body.host_context.host_user_id,
    "vox-account:aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  );
  assert.equal(body.authentication.adapter_external_key, "vox-web-primary");
  assert.equal(body.authentication.proof.type, "federated");
  assert.equal(body.authentication.proof.proof.authentication_token, undefined);
  assert.equal(
    (captured?.init.headers as Record<string, string>)["X-Vox-Host-Credential"],
    "11111111-2222-4333-8444-555555555555",
  );
});

test("consumer authentication fails closed when Core remaps an established account", async () => {
  const client = new VoxCoreHostClient(
    {
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
    },
    {
      fetch: async () =>
        Response.json({
          user_context_id: "22222222-3333-4444-8555-666666666666",
          adapter_external_key: "vox-web-primary",
          expires_at: "2026-11-25T00:05:00Z",
          authentication_token: "one-time",
        }),
      now: () => 1_795_622_400,
      nonce: () => "99999999-8888-4777-8666-555555555555",
    },
  );

  await assert.rejects(
    () =>
      client.authenticateAccount(
        "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        "77777777-3333-4444-8555-666666666666",
      ),
    /Core user context does not match the established account/,
  );
});
