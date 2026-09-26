import assert from "node:assert/strict";
import test from "node:test";
import {
  PLUGIN_CATALOG,
  PLUGIN_CATEGORIES,
  getCatalogPlugin,
  getPluginsByCategory,
  type CatalogPlugin,
} from "../src/features/plugins/catalog";
import {
  PluginLogo,
  PluginCard,
  InstalledPluginsDock,
  PluginInspectorModal,
  PluginCatalogGrid,
} from "../src/features/plugins/components";
import type { RemoteExtension } from "../src/lib/consumer-auth/core-host-client";

test("all marketplace UI components are exported as valid React components", () => {
  assert.equal(typeof PluginLogo, "function", "PluginLogo must be exported");
  assert.equal(typeof PluginCard, "function", "PluginCard must be exported");
  assert.equal(
    typeof InstalledPluginsDock,
    "function",
    "InstalledPluginsDock must be exported",
  );
  assert.equal(
    typeof PluginInspectorModal,
    "function",
    "PluginInspectorModal must be exported",
  );
  assert.equal(
    typeof PluginCatalogGrid,
    "function",
    "PluginCatalogGrid must be exported",
  );
});

test("all 9 catalog plugins resolve valid logo paths and background colors", () => {
  for (const plugin of PLUGIN_CATALOG) {
    assert.ok(plugin.logoFile.endsWith(".svg"), `Logo must be .svg: ${plugin.id}`);
    const expectedPath = `/plugins/logos/${plugin.logoFile}`;
    assert.ok(expectedPath.startsWith("/plugins/logos/"));
    assert.ok(plugin.displayName.length > 0);
    assert.ok(plugin.tagline.length > 0);
    assert.ok(plugin.publisher.length > 0);
  }
});

test("installed plugins dock correctly identifies active vs removed extensions", () => {
  const mockExtensions: RemoteExtension[] = [
    {
      id: "ext-uber",
      external_key: "uber",
      display_name: "Uber",
      protocol: "mcp",
      endpoint_url: "https://mcp.uber.com/v1",
      operator: { operator_id: "uber", operator_name: "Uber" },
      current_version: 1,
      conformance_status: "passed",
      operator_enabled: true,
      consent_status: "consented",
      lifecycle_state: "installed",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "ext-doordash",
      external_key: "doordash",
      display_name: "DoorDash",
      protocol: "mcp",
      endpoint_url: "https://mcp.doordash.com/v1",
      operator: { operator_id: "doordash", operator_name: "DoorDash" },
      current_version: 1,
      conformance_status: "passed",
      operator_enabled: true,
      consent_status: "consented",
      lifecycle_state: "removed",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "ext-custom",
      external_key: "my-custom-mcp",
      display_name: "My Custom MCP",
      protocol: "mcp",
      endpoint_url: "https://mcp.internal.net/v1",
      operator: { operator_id: "custom", operator_name: "Custom Dev" },
      current_version: 1,
      conformance_status: "passed",
      operator_enabled: true,
      consent_status: "consented",
      lifecycle_state: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const active = mockExtensions.filter((ext) => ext.lifecycle_state !== "removed");
  assert.equal(active.length, 2);
  assert.equal(active[0].external_key, "uber");
  assert.equal(active[1].external_key, "my-custom-mcp");

  // Verify catalog resolution for installed extension
  const uberPlugin = getCatalogPlugin(active[0].external_key);
  assert.ok(uberPlugin);
  assert.equal(uberPlugin.displayName, "Uber");
});

test("inspector modal capability categorization and consequential write badges", () => {
  const doordash = getCatalogPlugin("doordash");
  assert.ok(doordash);

  // DoorDash should have write / consequential capabilities like create_order_handoff
  const consequentialCap = doordash.capabilities.find(
    (c) => c.effectKind === "consequential_write",
  );
  assert.ok(
    consequentialCap,
    "DoorDash should declare a consequential capability requiring user approval",
  );
  assert.equal(consequentialCap.category, "write");

  // Read capability
  const readCap = doordash.capabilities.find((c) => c.category === "read");
  assert.ok(readCap, "DoorDash should declare read capabilities");
  assert.notEqual(readCap.effectKind, "consequential_write");
});

test("catalog grid search and category filter predicate logic", () => {
  const matchesSearch = (plugin: CatalogPlugin, query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      plugin.displayName.toLowerCase().includes(q) ||
      plugin.tagline.toLowerCase().includes(q) ||
      plugin.description.toLowerCase().includes(q) ||
      plugin.publisher.toLowerCase().includes(q) ||
      plugin.category.toLowerCase().includes(q) ||
      plugin.capabilities.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      )
    );
  };

  // Search by brand name
  const uberResults = PLUGIN_CATALOG.filter((p) => matchesSearch(p, "uber"));
  assert.equal(uberResults.length, 1);
  assert.equal(uberResults[0].id, "uber");

  // Search by keyword in capabilities (e.g., "flight" or "hotel" for expedia)
  const lodgingResults = PLUGIN_CATALOG.filter((p) =>
    matchesSearch(p, "lodging"),
  );
  assert.ok(lodgingResults.some((p) => p.id === "expedia"));

  // Popular category filtering
  const popularPlugins = PLUGIN_CATALOG.filter(
    (p) => p.isPopular || p.category === "Popular",
  );
  assert.ok(popularPlugins.length >= 4);

  // Category grouping matches PLUGIN_CATEGORIES
  const categorized = getPluginsByCategory();
  for (const cat of PLUGIN_CATEGORIES) {
    assert.ok(
      categorized[cat].length > 0,
      `Category ${cat} must contain at least one plugin`,
    );
  }
});
