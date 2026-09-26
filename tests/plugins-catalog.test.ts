import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  PLUGIN_CATALOG,
  PLUGIN_CATEGORIES,
  getCatalogPlugin,
  getPluginsByCategory,
  type PluginCategory,
} from "../src/features/plugins/catalog";

const REQUIRED_APP_IDS = [
  "uber",
  "doordash",
  "zomato",
  "instacart",
  "amazon",
  "spotify",
  "airbnb",
  "expedia",
  "google-calendar",
];

test("plugin catalog defines required consumer apps with unique IDs and valid capabilities", () => {
  assert.ok(
    PLUGIN_CATALOG.length >= 9,
    "Must include at least 9 consumer plugins",
  );
  const ids = new Set<string>();

  for (const plugin of PLUGIN_CATALOG) {
    assert.ok(!ids.has(plugin.id), `Duplicate plugin ID: ${plugin.id}`);
    ids.add(plugin.id);
    assert.ok(
      plugin.displayName.length > 0,
      `Display name missing for ${plugin.id}`,
    );
    assert.ok(plugin.tagline.length > 0, `Tagline missing for ${plugin.id}`);
    assert.ok(
      plugin.description.length > 0,
      `Description missing for ${plugin.id}`,
    );
    assert.ok(
      plugin.logoFile.endsWith(".svg"),
      `Logo must be an svg file: ${plugin.id}`,
    );
    assert.ok(
      plugin.backgroundColor.length > 0,
      `Background color missing for ${plugin.id}`,
    );
    assert.ok(
      typeof plugin.isPopular === "boolean",
      `isPopular must be a boolean: ${plugin.id}`,
    );
    assert.ok(
      ["oauth2", "api_key", "none"].includes(plugin.authType),
      `Invalid authType: ${plugin.authType}`,
    );
    assert.ok(
      plugin.publisher.length > 0,
      `Publisher missing for ${plugin.id}`,
    );
    assert.ok(
      plugin.rating >= 1 && plugin.rating <= 5,
      `Rating must be between 1 and 5: ${plugin.rating}`,
    );
    assert.ok(
      plugin.installsCount >= 0,
      `Installs count must be non-negative: ${plugin.installsCount}`,
    );
    assert.ok(
      plugin.capabilities.length > 0,
      `Capabilities missing for ${plugin.id}`,
    );
    assert.ok(
      plugin.endpointUrl.startsWith("https://"),
      `Endpoint must be HTTPS: ${plugin.id}`,
    );

    // Verify capabilities have valid structure
    for (const cap of plugin.capabilities) {
      assert.ok(cap.name.length > 0, `Capability name missing in ${plugin.id}`);
      assert.ok(
        cap.description.length > 0,
        `Capability description missing in ${plugin.id}`,
      );
      assert.ok(
        ["read", "write", "search"].includes(cap.category),
        `Capability category invalid in ${plugin.id}: ${cap.category}`,
      );
    }
  }

  for (const requiredId of REQUIRED_APP_IDS) {
    assert.ok(
      ids.has(requiredId),
      `Missing required app in catalog: ${requiredId}`,
    );
  }

  assert.ok(getCatalogPlugin("doordash"), "DoorDash must be in catalog");
  assert.ok(getCatalogPlugin("uber"), "Uber must be in catalog");
  assert.ok(getCatalogPlugin("zomato"), "Zomato must be in catalog");
  assert.equal(
    getCatalogPlugin("nonexistent"),
    undefined,
    "Non-existent plugin should return undefined",
  );

  const categories = getPluginsByCategory();
  assert.ok(
    categories["Popular"].length > 0,
    "Popular category must not be empty",
  );
  assert.ok(
    categories["Food & Groceries"].length > 0,
    "Food & Groceries must not be empty",
  );
  assert.ok(
    categories["Rides & Travel"].length > 0,
    "Rides & Travel must not be empty",
  );
  assert.ok(
    categories["Lifestyle & Essentials"].length > 0,
    "Lifestyle & Essentials must not be empty",
  );
});

test("all referenced logo files exist in public/plugins/logos", () => {
  const logosDir = path.resolve(process.cwd(), "public/plugins/logos");
  for (const plugin of PLUGIN_CATALOG) {
    const filePath = path.join(logosDir, plugin.logoFile);
    assert.ok(
      fs.existsSync(filePath),
      `Logo file does not exist on disk: ${plugin.logoFile}`,
    );
  }
});

test("PLUGIN_CATEGORIES includes all four expected category names", () => {
  const expected: PluginCategory[] = [
    "Popular",
    "Food & Groceries",
    "Rides & Travel",
    "Lifestyle & Essentials",
  ];
  assert.deepEqual(PLUGIN_CATEGORIES, expected);
});
