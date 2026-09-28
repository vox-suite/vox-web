import assert from "node:assert/strict";
import test from "node:test";
import { presentConnector } from "../src/features/plugins/catalog";
import { connectionFor } from "../src/features/plugins/connection-state";
import {
  PluginLogo,
  PluginCard,
  InstalledPluginsDock,
  PluginInspectorModal,
  PluginCatalogGrid,
} from "../src/features/plugins/components";
import { AppsScreen } from "../src/features/apps/components/apps-screen";
import { ExtensionsPanel } from "../src/features/extensions/components/extensions-panel";
import type { RemoteExtension } from "../src/lib/consumer-auth/core-host-client";

function extension(overrides: Partial<RemoteExtension>): RemoteExtension {
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

test("apps UI components are exported React components", () => {
  for (const component of [
    PluginLogo,
    PluginCard,
    InstalledPluginsDock,
    PluginInspectorModal,
    PluginCatalogGrid,
    AppsScreen,
    ExtensionsPanel,
  ]) {
    assert.equal(typeof component, "function");
  }
});

test("account authorization and operator review remain distinct states", () => {
  const zomato = presentConnector({ ...extension({}), capabilities: [] });
  assert.equal(connectionFor(zomato, [], []).state, "none");

  const added = extension({});
  assert.equal(connectionFor(zomato, [added], []).state, "incomplete");

  const live = {
    extension_id: added.id,
    connection_id: "connection-zomato",
    connected_at: new Date().toISOString(),
    lifecycle_state: "active" as const,
    tools: [{ name: "search_restaurants" }],
  };
  assert.equal(connectionFor(zomato, [added], [live]).state, "awaiting_review");
  const connected = connectionFor(
    zomato,
    [extension({ lifecycle_state: "active" })],
    [live],
  );
  assert.equal(connected.state, "reviewed");
  assert.equal(connected.connection?.tools[0].name, "search_restaurants");

  // Removed extensions never count, even with a stale connection record.
  assert.equal(
    connectionFor(zomato, [extension({ lifecycle_state: "removed" })], [live])
      .state,
    "none",
  );
});
