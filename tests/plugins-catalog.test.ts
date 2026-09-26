import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  PLUGIN_CATALOG,
  PLUGIN_CATEGORIES,
  connectablePlugins,
  endpointHost,
  getCatalogPlugin,
  getPluginsByCategory,
  type PluginCategory,
} from "../src/features/plugins/catalog";

test("every catalog app is a provider's official HTTPS MCP server with complete copy", () => {
  const ids = new Set<string>();
  for (const plugin of PLUGIN_CATALOG) {
    assert.ok(!ids.has(plugin.id), `Duplicate plugin ID: ${plugin.id}`);
    ids.add(plugin.id);
    assert.ok(plugin.displayName && plugin.tagline && plugin.description);
    assert.ok(plugin.publisher && plugin.operator.operatorName);
    assert.ok(plugin.highlights.length > 0, `Highlights missing: ${plugin.id}`);
    assert.equal(plugin.protocol, "mcp");
    assert.ok(["dynamic", "configured"].includes(plugin.registration));
    const url = new URL(plugin.endpointUrl);
    assert.equal(
      url.protocol,
      "https:",
      `Endpoint must be HTTPS: ${plugin.id}`,
    );
    assert.ok(plugin.logoFile.endsWith(".svg"));
  }
  assert.equal(getCatalogPlugin(" Zomato "), getCatalogPlugin("zomato"));
  assert.equal(getCatalogPlugin("nonexistent"), undefined);
});

test("apps without a public consumer MCP server are not listed", () => {
  for (const id of ["uber", "doordash", "airbnb", "amazon", "expedia"]) {
    assert.equal(getCatalogPlugin(id), undefined, `${id} must not be listed`);
  }
});

test("configured-client apps are only connectable once Core has their client", () => {
  const dynamic = PLUGIN_CATALOG.filter((p) => p.registration === "dynamic");
  const spotify = getCatalogPlugin("spotify");
  assert.ok(spotify && spotify.registration === "configured");

  assert.deepEqual(
    connectablePlugins([]).map((p) => p.id),
    dynamic.map((p) => p.id),
  );
  const withSpotify = connectablePlugins([endpointHost(spotify).toUpperCase()]);
  assert.ok(withSpotify.some((p) => p.id === "spotify"));
  assert.ok(!withSpotify.some((p) => p.id === "google-calendar"));
});

test("categories group every app and popular apps also appear under Popular", () => {
  const expected: PluginCategory[] = [
    "Popular",
    "Food & Groceries",
    "Productivity",
    "Media & Design",
  ];
  assert.deepEqual(PLUGIN_CATEGORIES, expected);
  const grouped = getPluginsByCategory();
  for (const category of expected) {
    assert.ok(grouped[category].length > 0, `${category} must not be empty`);
  }
  assert.deepEqual(
    grouped.Popular.map((p) => p.id),
    PLUGIN_CATALOG.filter((p) => p.isPopular).map((p) => p.id),
  );
});

test("all referenced logo files exist in public/plugins/logos", () => {
  const logosDir = path.resolve(process.cwd(), "public/plugins/logos");
  for (const plugin of PLUGIN_CATALOG) {
    assert.ok(
      fs.existsSync(path.join(logosDir, plugin.logoFile)),
      `Logo file does not exist on disk: ${plugin.logoFile}`,
    );
  }
});

test("every logo glyph is visible against its tile background", () => {
  const logosDir = path.resolve(process.cwd(), "public/plugins/logos");
  for (const plugin of PLUGIN_CATALOG) {
    const svg = fs.readFileSync(path.join(logosDir, plugin.logoFile), "utf-8");
    const fills = [...svg.matchAll(/fill="(#[0-9a-fA-F]{3,8})"/g)].map(
      ([, color]) => color.toLowerCase(),
    );
    assert.ok(fills.length > 0, `${plugin.logoFile} must declare a fill`);
    assert.ok(
      fills.some((fill) => fill !== plugin.backgroundColor.toLowerCase()),
      `${plugin.logoFile} is painted in its tile color ${plugin.backgroundColor}`,
    );
  }
});
