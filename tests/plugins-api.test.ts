import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { NextRequest } from "next/server";

// Neutralize "server-only" for Node.js test runner
const req = createRequire(process.cwd() + "/package.json");
try {
  const serverOnlyPath = req.resolve("server-only");
  req.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as unknown as NodeModule;
} catch {
  // ignore
}

import { presentConnector } from "../src/features/plugins/catalog";
import {
  connectPlugin,
  getConnectedApps,
  getPluginCatalog,
  uninstallPlugin,
} from "../src/features/plugins/api";
import { pluginKeys } from "../src/features/plugins/queries";
import type {
  RemoteExtension,
  VoxCoreHostClient,
} from "../src/lib/consumer-auth/core-host-client";
import { CoreHostRequestError } from "../src/lib/consumer-auth/core-host-client";
import type { ConsumerSession } from "../src/lib/consumer-auth/session";

async function loadModules() {
  const { GET: getCatalog } =
    await import("../src/app/api/account/plugins/catalog/route");
  const { POST: connectRoute } =
    await import("../src/app/api/account/plugins/connect/route");
  const { GET: statusRoute } =
    await import("../src/app/api/account/plugins/status/route");
  const { DELETE: uninstallRoute } =
    await import("../src/app/api/account/plugins/[id]/route");
  const { GET: callbackRoute } =
    await import("../src/app/app/(workspace)/apps/oauth/callback/route");
  const { setMockConsumerForTests } =
    await import("../src/lib/consumer-auth/session");
  const { setCoreHostClientForTests, resetConsumerAuthRuntimeForTests } =
    await import("../src/lib/consumer-auth/runtime");
  return {
    getCatalog,
    connectRoute,
    statusRoute,
    uninstallRoute,
    callbackRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  };
}

const mockSession: ConsumerSession = {
  accountId: "acc-user-123",
  coreUserContextId: "ctx-user-123",
  name: "Test User",
  email: "test@example.com",
  image: null,
  authenticationMethod: "google",
  expiresAt: new Date(Date.now() + 86400000),
  recoveryEnabled: true,
};

function extensionFixture(
  overrides: Partial<RemoteExtension> = {},
): RemoteExtension {
  return {
    id: "ext-notion",
    external_key: "notion",
    display_name: "Notion",
    protocol: "mcp",
    endpoint_url: "https://mcp.notion.com/mcp",
    operator: { operator_id: "notion", operator_name: "Notion Labs, Inc." },
    current_version: 1,
    conformance_status: "pending",
    operator_enabled: false,
    consent_status: "consented",
    lifecycle_state: "installed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function connectRequest(body: unknown, host = "app.voxagent.in") {
  return new NextRequest(`https://${host}/api/account/plugins/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host,
      origin: `https://${host}`,
    },
    body: JSON.stringify(body),
  });
}

test("catalog exposes only Core-reviewed packages and installation binds the reviewed digest", async () => {
  const {
    getCatalog,
    connectRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();
  const digest = "a".repeat(64);
  const calls: unknown[] = [];
  setCoreHostClientForTests({
    async listConnectorPackages() {
      return [
        {
          version: 2,
          digest,
          metadata: {
            schema_version: 1,
            protocol_version: "2025-11-25",
            auth_mode: "oauth",
            credential_custody: "platform_held",
            skills: [],
          },
          manifest: {
            external_key: "custom",
            display_name: "Custom connector",
            protocol: "mcp",
            endpoint_url: "https://custom.example/mcp",
            operator: {
              operator_id: "custom",
              operator_name: "Custom Operator",
            },
            capabilities: [
              {
                external_key: "custom.read",
                display_name: "Read custom",
                effect: "read",
                data_recipients: ["Custom Operator"],
              },
            ],
          },
        },
      ];
    },
    async setupConnectorPackage(
      _: string,
      setup: {
        external_key: string;
        version: number;
        digest: string;
        consent: unknown;
      },
    ) {
      calls.push({
        key: setup.external_key,
        version: setup.version,
        digest: setup.digest,
        consent: setup.consent,
      });
      return {
        setup_id: "setup",
        extension_id: "extension",
        external_key: setup.external_key,
        state: "authorize",
        authorization_url: "https://provider.example/authorize",
      };
    },
  } as unknown as VoxCoreHostClient);
  setMockConsumerForTests(null);
  assert.equal(
    (
      await getCatalog(
        new NextRequest("https://app.voxagent.in/api/account/plugins/catalog"),
      )
    ).status,
    401,
  );
  setMockConsumerForTests(mockSession);
  const catalog = await (
    await getCatalog(
      new NextRequest("https://app.voxagent.in/api/account/plugins/catalog"),
    )
  ).json();
  assert.equal(catalog.length, 1);
  assert.equal(catalog[0].id, "custom");
  assert.equal(catalog[0].packageDigest, digest);
  assert.equal(catalog[0].metadata.auth_mode, "oauth");
  assert.equal(catalog[0].metadata.credential_custody, "platform_held");
  assert.deepEqual(catalog[0].capabilities, [
    {
      external_key: "custom.read",
      display_name: "Read custom",
      effect: "read",
      data_recipients: ["Custom Operator"],
    },
  ]);
  assert.equal(
    (await connectRoute(connectRequest({ pluginId: "custom" }))).status,
    400,
  );
  for (const invalid of [
    null,
    [],
    1,
    "custom",
    { pluginId: "custom", version: 0, digest },
  ]) {
    assert.equal((await connectRoute(connectRequest(invalid))).status, 400);
  }
  assert.equal(calls.length, 0);
  const result = await connectRoute(
    connectRequest({ pluginId: "custom", version: 2, digest, consent: null }),
  );
  assert.equal(result.status, 200);
  assert.equal(
    (await result.json()).authorizationUrl,
    "https://provider.example/authorize",
  );
  assert.deepEqual(calls, [
    { key: "custom", version: 2, digest, consent: null },
  ]);
  const consent = {
    agent_external_key: "general",
    agent_instruction_version: 3,
    capability_external_keys: ["custom.read"],
    enable_bundled_skills: false,
  };
  assert.equal(
    (
      await connectRoute(
        connectRequest({ pluginId: "custom", version: 2, digest, consent }),
      )
    ).status,
    200,
  );
  assert.deepEqual(calls[1], { key: "custom", version: 2, digest, consent });
  const crossOrigin = connectRequest({
    pluginId: "custom",
    version: 2,
    digest,
    consent,
  });
  crossOrigin.headers.set("origin", "https://attacker.example");
  assert.equal((await connectRoute(crossOrigin)).status, 403);
  assert.equal(calls.length, 2);
  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("GET /apps/oauth/callback completes the connection and returns to the apps page", async () => {
  const {
    callbackRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();
  const completions: {
    state: string;
    code: string;
    issuer: string | null | undefined;
  }[] = [];
  let failWith: string | null = null;
  setCoreHostClientForTests({
    async completeConnectorSetup(
      _: string,
      state: string,
      code: string,
      issuer?: string | null,
    ) {
      if (failWith) {
        throw new CoreHostRequestError(
          410,
          "/v1/connected-apps/callback",
          failWith,
        );
      }
      completions.push({ state, code, issuer });
      return {
        setup_id: "setup",
        extension_id: "extension",
        external_key: "notion",
        state: "complete",
        authorization_url: null,
      };
    },
  } as unknown as VoxCoreHostClient);
  const callback = async (query: string) => {
    const res = await callbackRoute(
      new NextRequest(
        `https://app.voxagent.in/app/apps/oauth/callback?${query}`,
        { headers: { host: "app.voxagent.in" } },
      ),
    );
    return new URL(res.headers.get("location")!);
  };

  setMockConsumerForTests(null);
  assert.equal((await callback("code=c&state=s")).pathname, "/");
  assert.equal(completions.length, 0);

  setMockConsumerForTests(mockSession);
  const ok = await callback(
    "code=c1&state=s1&iss=https%3A%2F%2Fissuer.example",
  );
  assert.equal(ok.pathname, "/apps");
  assert.equal(ok.searchParams.get("authorization_complete"), "notion");
  assert.deepEqual(completions, [
    { state: "s1", code: "c1", issuer: "https://issuer.example" },
  ]);

  const denied = await callback("error=access_denied&state=s");
  assert.equal(denied.searchParams.get("connect_error"), "access_denied");

  const missing = await callback("state=s");
  assert.equal(missing.searchParams.get("connect_error"), "invalid_request");

  failWith = "authorization_expired";
  const expired = await callback("code=c&state=s");
  assert.equal(
    expired.searchParams.get("connect_error"),
    "authorization_expired",
  );

  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("extension consent requires a signed-in user and an exact reviewed version", async () => {
  const { POST: renew } =
    await import("../src/app/api/account/extensions/[id]/renew-consent/route");
  const { setMockConsumerForTests } =
    await import("../src/lib/consumer-auth/session");
  const { setCoreHostClientForTests, resetConsumerAuthRuntimeForTests } =
    await import("../src/lib/consumer-auth/runtime");
  const calls: number[] = [];
  setCoreHostClientForTests({
    async renewExtensionConsent(_: string, __: string, version: number) {
      calls.push(version);
      return extensionFixture({
        current_version: version,
        consent_status: "consented",
      });
    },
  } as unknown as VoxCoreHostClient);
  const send = (body: unknown) =>
    renew(
      new NextRequest(
        "https://app.voxagent.in/api/account/extensions/ext-notion/renew-consent",
        {
          method: "POST",
          headers: {
            host: "app.voxagent.in",
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        },
      ),
      { params: Promise.resolve({ id: "ext-notion" }) },
    );
  setMockConsumerForTests(null);
  assert.equal((await send({ version: 2, confirmed: true })).status, 401);
  setMockConsumerForTests(mockSession);
  assert.equal((await send({ version: 2, confirmed: false })).status, 400);
  assert.equal((await send({ version: "2", confirmed: true })).status, 400);
  assert.equal(calls.length, 0);
  assert.equal((await send({ version: 2, confirmed: true })).status, 200);
  assert.deepEqual(calls, [2]);
  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("GET /api/account/plugins/status returns the account's live connections", async () => {
  const {
    statusRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();
  const request = () =>
    new NextRequest("http://localhost/api/account/plugins/status");

  setMockConsumerForTests(null);
  assert.equal((await statusRoute(request())).status, 401);

  setMockConsumerForTests(mockSession);
  const connected = [
    {
      extension_id: "ext-notion",
      connected_at: "",
      lifecycle_state: "active",
      tools: [{ name: "search" }],
    },
  ];
  setCoreHostClientForTests({
    async connectedAppsStatus() {
      return { configured_hosts: ["some-host"], connected };
    },
  } as unknown as VoxCoreHostClient);
  assert.deepEqual(await (await statusRoute(request())).json(), { connected });

  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("DELETE /api/account/plugins/[id] removes the app by plugin or extension ID", async () => {
  const {
    uninstallRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();
  setMockConsumerForTests(mockSession);

  let removedId: string | null = null;
  const extensions = [extensionFixture({ id: "uuid-ext-notion" })];
  setCoreHostClientForTests({
    async listExtensions() {
      return extensions;
    },
    async removeExtension(_: string, extensionId: string) {
      removedId = extensionId;
      return { ...extensions[0], lifecycle_state: "removed" };
    },
  } as unknown as VoxCoreHostClient);

  const remove = (id: string) =>
    uninstallRoute(
      new NextRequest(`http://localhost/api/account/plugins/${id}`, {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id }) },
    );
  for (const id of ["notion", "uuid-ext-notion"]) {
    removedId = null;
    assert.equal((await remove(id)).status, 200);
    assert.equal(removedId, "uuid-ext-notion");
  }
  assert.equal((await remove("unknown")).status, 404);

  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("client api functions call the plugin routes", async () => {
  assert.deepEqual(pluginKeys.catalog(), ["plugins", "catalog"]);
  assert.deepEqual(pluginKeys.connected(), ["plugins", "connected"]);

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => {
      assert.ok(String(url).includes("/api/account/plugins/catalog"));
      assert.equal(init?.method, "GET");
      return Response.json([
        presentConnector(
          {
            external_key: "custom",
            display_name: "Custom",
            protocol: "mcp",
            endpoint_url: "https://example.com/mcp",
            operator: { operator_id: "custom", operator_name: "Custom" },
            capabilities: [],
          },
          1,
          "a".repeat(64),
        ),
      ]);
    };
    assert.equal((await getPluginCatalog()).length, 1);

    globalThis.fetch = async (url) => {
      assert.ok(String(url).includes("/api/account/plugins/status"));
      return Response.json({ connected: [] });
    };
    assert.deepEqual(await getConnectedApps(), []);

    globalThis.fetch = async (url, init) => {
      assert.ok(String(url).includes("/api/account/plugins/connect"));
      assert.equal(init?.method, "POST");
      assert.equal(JSON.parse(String(init?.body)).pluginId, "notion");
      return Response.json({
        status: "authorize",
        authorizationUrl: "https://x",
        extension: {},
      });
    };
    assert.equal(
      (await connectPlugin("notion", 1, "a".repeat(64), null)).status,
      "authorize",
    );

    globalThis.fetch = async (url, init) => {
      assert.ok(String(url).includes("/api/account/plugins/ext-notion"));
      assert.equal(init?.method, "DELETE");
      return Response.json({ success: true });
    };
    assert.equal((await uninstallPlugin("ext-notion")).success, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
