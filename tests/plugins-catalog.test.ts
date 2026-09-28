import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { PLUGIN_BRANDS } from "../src/features/plugins/catalog";

test("all referenced logo files exist in public/plugins/logos", () => {
  const logosDir = path.resolve(process.cwd(), "public/plugins/logos");
  for (const plugin of PLUGIN_BRANDS) {
    assert.ok(
      fs.existsSync(path.join(logosDir, plugin.logoFile)),
      `Logo file does not exist on disk: ${plugin.logoFile}`,
    );
  }
});

test("every logo glyph is visible against its tile background", () => {
  const logosDir = path.resolve(process.cwd(), "public/plugins/logos");
  for (const plugin of PLUGIN_BRANDS) {
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
