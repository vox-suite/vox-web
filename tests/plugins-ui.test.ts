import assert from "node:assert/strict";
import test from "node:test";
import { presentConnector } from "../src/features/plugins/catalog";
import { connectionFor } from "../src/features/plugins/connection-state";
import {
  PluginLogo,
  PluginCard,
  PluginInspectorModal,
  PluginCatalogGrid,
} from "../src/features/plugins/components";
import { AppsScreen } from "../src/features/apps/components/apps-screen";
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
    PluginInspectorModal,
    PluginCatalogGrid,
    AppsScreen,
  ]) {
    assert.equal(typeof component, "function");
  }
});

test("account authorization and operator review remain distinct states", () => {
  const zomato = presentConnector({ ...extension({}), capabilities: [] });
  assert.equal(connectionFor(zomato, [], []).state, "none");

  const added = extension({});
  assert.equal(connectionFor(zomato, [added], []).state, "incomplete");

  for (const lifecycle_state of ["disabled", "quarantined"] as const) {
    assert.equal(
      connectionFor(zomato, [extension({ lifecycle_state })], []).state,
      "unavailable",
    );
  }
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

test("reviewed package metadata stays attached to the catalog presentation", () => {
  const manifest = {
    ...extension({ external_key: "public-notes" }),
    capabilities: [
      {
        external_key: "notes.read",
        display_name: "Read notes",
        effect: "read" as const,
        input_schema: { type: "object" },
        data_recipients: ["Notes operator"],
        access_needs: [],
      },
    ],
  };
  const metadata = {
    schema_version: 1,
    protocol_version: "2025-11-25",
    auth_mode: "none" as const,
    credential_custody: "none" as const,
    skills: [{ external_key: "summarize", version: 2, digest: "a".repeat(64) }],
  };
  const plugin = presentConnector(manifest, 3, "b".repeat(64), metadata);
  assert.equal(plugin.metadata?.auth_mode, "none");
  assert.deepEqual(plugin.metadata?.skills, metadata.skills);
  assert.equal(plugin.capabilities[0].data_recipients?.[0], "Notes operator");
});
