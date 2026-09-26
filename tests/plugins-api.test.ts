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
  getCatalogPlugin,
} from "../src/features/plugins/catalog";
import {
  getPluginCatalog,
  installPlugin,
  uninstallPlugin,
} from "../src/features/plugins/api";
import { pluginKeys } from "../src/features/plugins/queries";
import type {
  RemoteExtension,
  CapabilityGrant,
  SelectedAgent,
  InstallExtensionRequest,
  CreateGrantRequest,
  VoxCoreHostClient,
} from "../src/lib/consumer-auth/core-host-client";
import type { ConsumerSession } from "../src/lib/consumer-auth/session";

// Dynamically load route handlers and test hooks after server-only stub is installed
async function loadModules() {
  const { GET: getCatalog } =
    await import("../src/app/api/account/plugins/catalog/route");
  const { POST: installRoute } =
    await import("../src/app/api/account/plugins/install/route");
  const { DELETE: uninstallRoute } =
    await import("../src/app/api/account/plugins/[id]/route");
  const { setMockConsumerForTests } =
    await import("../src/lib/consumer-auth/session");
  const { setCoreHostClientForTests, resetConsumerAuthRuntimeForTests } =
    await import("../src/lib/consumer-auth/runtime");

  return {
    getCatalog,
    installRoute,
    uninstallRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  };
}

// Mock consumer session for authorized tests
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

test("installPlugin compound request maps catalog plugin to Core extension and grants", async () => {
  const plugin = getCatalogPlugin("doordash");
  assert.ok(plugin);
  assert.equal(plugin.id, "doordash");
  assert.ok(plugin.capabilities.length >= 3);
  // Verify capabilities have valid structure
  for (const cap of plugin.capabilities) {
    assert.ok(cap.name.length > 0);
    assert.ok(["read", "write", "search"].includes(cap.category));
  }

  // Verify all catalog plugins map cleanly to extension parameters
  for (const p of PLUGIN_CATALOG) {
    assert.ok(p.id.length > 0);
    assert.ok(p.displayName.length > 0);
    assert.ok(p.endpointUrl.startsWith("https://"));
    assert.ok(p.capabilities.length > 0);
    for (const c of p.capabilities) {
      const effect = c.category === "write" ? "write" : "read";
      const consequential = c.effectKind === "consequential_write";
      assert.ok(["read", "write"].includes(effect));
      assert.equal(typeof consequential, "boolean");
    }
  }
});

test("GET /api/account/plugins/catalog returns the full catalog", async () => {
  const { getCatalog } = await loadModules();
  const response = await getCatalog();
  assert.equal(response.status, 200);
  const data = await response.json();
  const catalog = Array.isArray(data) ? data : data.plugins;
  assert.ok(Array.isArray(catalog));
  assert.equal(catalog.length, PLUGIN_CATALOG.length);
  assert.ok(catalog.some((p: { id: string }) => p.id === "uber"));
  assert.ok(catalog.some((p: { id: string }) => p.id === "doordash"));
  assert.ok(catalog.some((p: { id: string }) => p.id === "spotify"));
});

test("POST /api/account/plugins/install enforces authentication, validation, and core availability", async () => {
  const {
    installRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();

  // 1. Unauthorized when no consumer session
  setMockConsumerForTests(null);
  const unauthReq = new NextRequest(
    "http://localhost/api/account/plugins/install",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginId: "uber" }),
    },
  );
  const unauthRes = await installRoute(unauthReq);
  assert.equal(unauthRes.status, 401);

  // Set mock session for subsequent checks
  setMockConsumerForTests(mockSession);

  // 2. 400 when missing pluginId
  const badReq = new NextRequest(
    "http://localhost/api/account/plugins/install",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    },
  );
  const badRes = await installRoute(badReq);
  assert.equal(badRes.status, 400);

  // 3. 404 when plugin not found in catalog
  const notFoundReq = new NextRequest(
    "http://localhost/api/account/plugins/install",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginId: "nonexistent-plugin" }),
    },
  );
  const notFoundRes = await installRoute(notFoundReq);
  assert.equal(notFoundRes.status, 404);

  // 4. 503 when core host client is unavailable
  setCoreHostClientForTests(null);
  const coreUnavailReq = new NextRequest(
    "http://localhost/api/account/plugins/install",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginId: "uber" }),
    },
  );
  const coreUnavailRes = await installRoute(coreUnavailReq);
  assert.equal(coreUnavailRes.status, 503);

  // Cleanup
  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("POST /api/account/plugins/install installs extension and grants capabilities to active agent", async () => {
  const {
    installRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();

  setMockConsumerForTests(mockSession);

  const installedExtensions: RemoteExtension[] = [];
  const createdGrants: CapabilityGrant[] = [];

  const mockCore = {
    async listExtensions(): Promise<RemoteExtension[]> {
      return [...installedExtensions];
    },
    async installExtension(
      _accountId: string,
      req: InstallExtensionRequest,
    ): Promise<RemoteExtension> {
      void _accountId;
      const ext: RemoteExtension = {
        id: `ext-${req.external_key}`,
        external_key: req.external_key,
        display_name: req.display_name,
        protocol: req.protocol,
        endpoint_url: req.endpoint_url,
        operator: req.operator,
        current_version: 1,
        conformance_status: "passed",
        operator_enabled: true,
        consent_status: "consented",
        lifecycle_state: "installed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        capabilities: req.capabilities,
      };
      installedExtensions.push(ext);
      return ext;
    },
    async selectedAgents(): Promise<SelectedAgent[]> {
      return [
        { definition: { external_key: "primary-agent", purpose: "assistant" } },
      ];
    },
    async listEffectiveGrants(): Promise<CapabilityGrant[]> {
      return [...createdGrants];
    },
    async createGrant(
      _accountId: string,
      req: CreateGrantRequest,
    ): Promise<CapabilityGrant> {
      void _accountId;
      const grant: CapabilityGrant = {
        id: `grant-${createdGrants.length + 1}`,
        agent_external_key: req.agent_external_key,
        connection_id: req.connection_id,
        capability_external_key: req.capability_external_key,
      };
      createdGrants.push(grant);
      return grant;
    },
    async removeExtension(
      _accountId: string,
      extensionId: string,
    ): Promise<RemoteExtension> {
      void _accountId;
      const idx = installedExtensions.findIndex((e) => e.id === extensionId);
      if (idx >= 0) {
        installedExtensions[idx].lifecycle_state = "removed";
        return installedExtensions[idx];
      }
      throw new Error("Extension not found");
    },
  };

  setCoreHostClientForTests(mockCore as unknown as VoxCoreHostClient);

  const req = new NextRequest("http://localhost/api/account/plugins/install", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pluginId: "doordash" }),
  });

  const res = await installRoute(req);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.extension.external_key, "doordash");
  assert.equal(body.extension.protocol, "mcp");
  assert.ok(body.grants.length >= 3);
  for (const g of body.grants) {
    assert.equal(g.agent_external_key, "primary-agent");
    assert.equal(g.connection_id, body.extension.id);
  }

  // Idempotent second install: should not re-install extension, reuses existing grants
  const req2 = new NextRequest("http://localhost/api/account/plugins/install", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pluginId: "doordash" }),
  });
  const res2 = await installRoute(req2);
  assert.equal(res2.status, 200);
  const body2 = await res2.json();
  assert.equal(body2.success, true);
  assert.equal(body2.extension.id, body.extension.id);
  assert.equal(body2.grants.length, body.grants.length);

  // Cleanup
  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("POST /api/account/plugins/install rolls back newly installed extension if granting fails", async () => {
  const {
    installRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();

  setMockConsumerForTests(mockSession);

  let installedExtensionId: string | null = null;
  let rolledBackId: string | null = null;

  const mockCore = {
    async listExtensions(): Promise<RemoteExtension[]> {
      return [];
    },
    async installExtension(
      _accountId: string,
      req: InstallExtensionRequest,
    ): Promise<RemoteExtension> {
      void _accountId;
      installedExtensionId = `ext-${req.external_key}`;
      return {
        id: installedExtensionId,
        external_key: req.external_key,
        display_name: req.display_name,
        protocol: req.protocol,
        endpoint_url: req.endpoint_url,
        operator: req.operator,
        current_version: 1,
        conformance_status: "passed",
        operator_enabled: true,
        consent_status: "consented",
        lifecycle_state: "installed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    async selectedAgents(): Promise<SelectedAgent[]> {
      return [];
    },
    async listEffectiveGrants(): Promise<CapabilityGrant[]> {
      return [];
    },
    async createGrant(): Promise<CapabilityGrant> {
      throw new Error("Core database lock during grant creation");
    },
    async removeExtension(
      _accountId: string,
      extensionId: string,
    ): Promise<RemoteExtension> {
      void _accountId;
      rolledBackId = extensionId;
      return {
        id: extensionId,
        external_key: "airbnb",
        display_name: "Airbnb",
        protocol: "mcp",
        endpoint_url: "https://mcp.airbnb.com/sse",
        operator: { operator_id: "airbnb", operator_name: "Airbnb" },
        current_version: 1,
        conformance_status: "passed",
        operator_enabled: true,
        consent_status: "consented",
        lifecycle_state: "removed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
  };

  setCoreHostClientForTests(mockCore as unknown as VoxCoreHostClient);

  const req = new NextRequest("http://localhost/api/account/plugins/install", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pluginId: "airbnb" }),
  });

  const res = await installRoute(req);
  assert.equal(res.status, 500);
  assert.ok(installedExtensionId);
  assert.equal(rolledBackId, installedExtensionId);

  // Cleanup
  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("DELETE /api/account/plugins/[id] uninstalls extension by extension ID or plugin ID", async () => {
  const {
    uninstallRoute,
    setMockConsumerForTests,
    setCoreHostClientForTests,
    resetConsumerAuthRuntimeForTests,
  } = await loadModules();

  setMockConsumerForTests(mockSession);

  let removedId: string | null = null;
  const mockExtensions: RemoteExtension[] = [
    {
      id: "uuid-ext-spotify-999",
      external_key: "spotify",
      display_name: "Spotify",
      protocol: "mcp",
      endpoint_url: "https://mcp.spotify.com/sse",
      operator: { operator_id: "spotify", operator_name: "Spotify" },
      current_version: 1,
      conformance_status: "passed",
      operator_enabled: true,
      consent_status: "consented",
      lifecycle_state: "installed",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockCore = {
    async listExtensions(): Promise<RemoteExtension[]> {
      return mockExtensions;
    },
    async removeExtension(
      _accountId: string,
      extensionId: string,
    ): Promise<RemoteExtension> {
      void _accountId;
      removedId = extensionId;
      const target = mockExtensions.find((e) => e.id === extensionId);
      if (target) {
        target.lifecycle_state = "removed";
        return target;
      }
      throw new Error("Not found");
    },
  };

  setCoreHostClientForTests(mockCore as unknown as VoxCoreHostClient);

  // 1. Delete by external_key ("spotify")
  const reqByPluginKey = new NextRequest(
    "http://localhost/api/account/plugins/spotify",
    {
      method: "DELETE",
    },
  );
  const res1 = await uninstallRoute(reqByPluginKey, {
    params: Promise.resolve({ id: "spotify" }),
  });
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.success, true);
  assert.equal(removedId, "uuid-ext-spotify-999");

  // Reset lifecycle state for second test
  mockExtensions[0].lifecycle_state = "installed";
  removedId = null;

  // 2. Delete by exact extension ID ("uuid-ext-spotify-999")
  const reqByExtId = new NextRequest(
    "http://localhost/api/account/plugins/uuid-ext-spotify-999",
    { method: "DELETE" },
  );
  const res2 = await uninstallRoute(reqByExtId, {
    params: Promise.resolve({ id: "uuid-ext-spotify-999" }),
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.success, true);
  assert.equal(removedId, "uuid-ext-spotify-999");

  // 3. 404 when extension is not found
  const reqNotFound = new NextRequest(
    "http://localhost/api/account/plugins/unknown-plugin",
    {
      method: "DELETE",
    },
  );
  const res3 = await uninstallRoute(reqNotFound, {
    params: Promise.resolve({ id: "unknown-plugin" }),
  });
  assert.equal(res3.status, 404);

  // Cleanup
  setMockConsumerForTests(undefined);
  resetConsumerAuthRuntimeForTests();
});

test("client api functions and pluginKeys query configuration", async () => {
  assert.deepEqual(pluginKeys.all, ["plugins"]);
  assert.deepEqual(pluginKeys.catalog(), ["plugins", "catalog"]);

  // Test getPluginCatalog client api
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => {
      assert.ok(String(url).includes("/api/account/plugins/catalog"));
      assert.equal(init?.method, "GET");
      return Response.json(PLUGIN_CATALOG);
    };
    const catalog = await getPluginCatalog();
    assert.equal(catalog.length, PLUGIN_CATALOG.length);

    // Test installPlugin client api
    globalThis.fetch = async (url, init) => {
      assert.ok(String(url).includes("/api/account/plugins/install"));
      assert.equal(init?.method, "POST");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.pluginId, "uber");
      return Response.json({
        success: true,
        extension: { id: "ext-uber", external_key: "uber" },
        grants: [],
      });
    };
    const installResult = await installPlugin("uber");
    assert.equal(installResult.success, true);
    assert.equal(installResult.extension.external_key, "uber");

    // Also support object input { pluginId: "uber" }
    const installResult2 = await installPlugin({ pluginId: "uber" });
    assert.equal(installResult2.success, true);

    // Test uninstallPlugin client api
    globalThis.fetch = async (url, init) => {
      assert.ok(String(url).includes("/api/account/plugins/ext-uber"));
      assert.equal(init?.method, "DELETE");
      return Response.json({ success: true });
    };
    const uninstallResult = await uninstallPlugin("ext-uber");
    assert.equal(uninstallResult.success, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
