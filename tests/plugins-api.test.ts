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

import {
  PLUGIN_CATALOG,
  connectablePlugins,
} from "../src/features/plugins/catalog";
import {
  connectPlugin,
  getConnectedApps,
  getPluginCatalog,
  uninstallPlugin,
} from "../src/features/plugins/api";
import { pluginKeys } from "../src/features/plugins/queries";
import type {
  ConnectedAppsStatus,
  InstallExtensionRequest,
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
    id: "ext-zomato",
    external_key: "zomato",
    display_name: "Zomato",
    protocol: "mcp",
    endpoint_url: "https://mcp-server.zomato.com/mcp",
    operator: { operator_id: "zomato", operator_name: "Zomato Ltd." },
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

const emptyStatus: ConnectedAppsStatus = {
  configured_hosts: [],
  connected: [],
};

function connectRequest(body: unknown, host = "app.voxagent.in") {
  return new NextRequest(`https://${host}/api/account/plugins/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json", host },
    body: JSON.stringify(body),
  });
}

test("GET /api/account/plugins/catalog lists configured-client apps only when Core has them", async () => {
  const {
    getCatalog,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();

  setMockConsumerForTests(null);
  const anonymous = await (
    await getCatalog(
      new NextRequest("http://localhost/api/account/plugins/catalog"),
    )
  ).json();
  assert.deepEqual(
    anonymous.map((p: { id: string }) => p.id),
    connectablePlugins([]).map((p) => p.id),
  );

  setMockConsumerForTests(mockSession);
  setCoreHostClientForTests({
    async connectedAppsStatus() {
      return {
        ...emptyStatus,
        configured_hosts: ["mcp-gateway-external-pilot.spotify.net"],
      };
    },
  } as unknown as VoxCoreHostClient);
  const signedIn = await (
    await getCatalog(
      new NextRequest("http://localhost/api/account/plugins/catalog"),
    )
  ).json();
  assert.ok(signedIn.some((p: { id: string }) => p.id === "spotify"));
  assert.ok(!signedIn.some((p: { id: string }) => p.id === "google-calendar"));

  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("POST /api/account/plugins/connect validates the session, body, and plugin", async () => {
  const {
    connectRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();

  setMockConsumerForTests(null);
  assert.equal(
    (await connectRoute(connectRequest({ pluginId: "zomato" }))).status,
    401,
  );

  setMockConsumerForTests(mockSession);
  assert.equal((await connectRoute(connectRequest({}))).status, 400);
  assert.equal(
    (await connectRoute(connectRequest({ pluginId: "uber" }))).status,
    404,
  );
  setCoreHostClientForTests(null);
  assert.equal(
    (await connectRoute(connectRequest({ pluginId: "zomato" }))).status,
    503,
  );

  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("POST /api/account/plugins/connect installs the app and returns the provider sign-in URL", async () => {
  const {
    connectRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();
  setMockConsumerForTests(mockSession);

  const installed: RemoteExtension[] = [];
  const authorizeCalls: { extensionId: string; redirectUri: string }[] = [];
  let status: ConnectedAppsStatus = emptyStatus;
  setCoreHostClientForTests({
    async listExtensions() {
      return [...installed];
    },
    async installExtension(_: string, request: InstallExtensionRequest) {
      assert.equal(request.external_key, "zomato");
      assert.equal(request.endpoint_url, "https://mcp-server.zomato.com/mcp");
      assert.equal(request.protocol, "mcp");
      const ext = extensionFixture();
      installed.push(ext);
      return ext;
    },
    async connectedAppsStatus() {
      return status;
    },
    async authorizeExtension(
      _: string,
      extensionId: string,
      redirectUri: string,
    ) {
      authorizeCalls.push({ extensionId, redirectUri });
      return {
        authorization_url: "https://mcp-server.zomato.com/authorize?state=s",
        expires_at: new Date().toISOString(),
      };
    },
  } as unknown as VoxCoreHostClient);

  const res = await connectRoute(connectRequest({ pluginId: "zomato" }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "authorize");
  assert.equal(
    body.authorizationUrl,
    "https://mcp-server.zomato.com/authorize?state=s",
  );
  // On the consumer host the callback has no /app prefix.
  assert.deepEqual(authorizeCalls, [
    {
      extensionId: "ext-zomato",
      redirectUri: "https://app.voxagent.in/apps/oauth/callback",
    },
  ]);

  // Elsewhere (previews, local) routes live under /app.
  await connectRoute(connectRequest({ pluginId: "zomato" }, "localhost:3000"));
  assert.equal(
    authorizeCalls[1].redirectUri,
    "https://localhost:3000/app/apps/oauth/callback",
  );
  assert.equal(installed.length, 1, "an existing install is reused");

  // Once connected, no new sign-in is started.
  status = {
    ...emptyStatus,
    connected: [{ extension_id: "ext-zomato", connected_at: "", tools: [] }],
  };
  const again = await (
    await connectRoute(connectRequest({ pluginId: "zomato" }))
  ).json();
  assert.equal(again.status, "connected");
  assert.equal(authorizeCalls.length, 2);

  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("POST /api/account/plugins/connect shares one attempt between overlapping clicks and adopts a 409 winner", async () => {
  const {
    connectRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();
  setMockConsumerForTests(mockSession);

  let installs = 0;
  let lists = 0;
  setCoreHostClientForTests({
    async listExtensions() {
      lists += 1;
      return lists === 1 ? [] : [extensionFixture()];
    },
    async installExtension() {
      installs += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      throw new CoreHostRequestError(409, "/v1/remote-extensions");
    },
    async connectedAppsStatus() {
      return emptyStatus;
    },
    async authorizeExtension() {
      return { authorization_url: "https://x.example/auth", expires_at: "" };
    },
  } as unknown as VoxCoreHostClient);

  const [a, b] = await Promise.all([
    connectRoute(connectRequest({ pluginId: "zomato" })),
    connectRoute(connectRequest({ pluginId: "zomato" })),
  ]);
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(installs, 1);
  assert.equal((await a.json()).status, "authorize");

  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("POST /api/account/plugins/connect explains Core failures without leaking internals", async () => {
  const {
    connectRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();
  setMockConsumerForTests(mockSession);
  setCoreHostClientForTests({
    async listExtensions() {
      return [extensionFixture()];
    },
    async connectedAppsStatus() {
      return emptyStatus;
    },
    async authorizeExtension() {
      throw new CoreHostRequestError(
        502,
        "/v1/remote-extensions/x/authorize",
        "provider_error",
      );
    },
  } as unknown as VoxCoreHostClient);

  const res = await connectRoute(connectRequest({ pluginId: "zomato" }));
  assert.equal(res.status, 502);
  const body = await res.json();
  assert.equal(body.code, "provider_error");
  assert.match(body.error, /couldn't be reached/);
  assert.doesNotMatch(body.error, /v1\//);

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
  const completions: { state: string; code: string }[] = [];
  let failWith: string | null = null;
  setCoreHostClientForTests({
    async completeConnection(_: string, state: string, code: string) {
      if (failWith) {
        throw new CoreHostRequestError(
          410,
          "/v1/connected-apps/callback",
          failWith,
        );
      }
      completions.push({ state, code });
      return extensionFixture({ lifecycle_state: "active" });
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
  const ok = await callback("code=c1&state=s1");
  assert.equal(ok.pathname, "/apps");
  assert.equal(ok.searchParams.get("connected"), "zomato");
  assert.deepEqual(completions, [{ state: "s1", code: "c1" }]);

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
      extension_id: "ext-zomato",
      connected_at: "",
      tools: [{ name: "search", read_only: true }],
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
  const extensions = [extensionFixture({ id: "uuid-ext-zomato" })];
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
  for (const id of ["zomato", "uuid-ext-zomato"]) {
    removedId = null;
    assert.equal((await remove(id)).status, 200);
    assert.equal(removedId, "uuid-ext-zomato");
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
      return Response.json(PLUGIN_CATALOG);
    };
    assert.equal((await getPluginCatalog()).length, PLUGIN_CATALOG.length);

    globalThis.fetch = async (url) => {
      assert.ok(String(url).includes("/api/account/plugins/status"));
      return Response.json({ connected: [] });
    };
    assert.deepEqual(await getConnectedApps(), []);

    globalThis.fetch = async (url, init) => {
      assert.ok(String(url).includes("/api/account/plugins/connect"));
      assert.equal(init?.method, "POST");
      assert.equal(JSON.parse(String(init?.body)).pluginId, "zomato");
      return Response.json({
        status: "authorize",
        authorizationUrl: "https://x",
        extension: {},
      });
    };
    assert.equal((await connectPlugin("zomato")).status, "authorize");

    globalThis.fetch = async (url, init) => {
      assert.ok(String(url).includes("/api/account/plugins/ext-zomato"));
      assert.equal(init?.method, "DELETE");
      return Response.json({ success: true });
    };
    assert.equal((await uninstallPlugin("ext-zomato")).success, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
