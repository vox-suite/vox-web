import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const REQUIRED_LOGOS = [
  "uber.svg",
  "doordash.svg",
  "zomato.svg",
  "amazon.svg",
  "instacart.svg",
  "spotify.svg",
  "airbnb.svg",
  "expedia.svg",
  "google-calendar.svg",
];

test("all required brand logos exist as valid non-empty SVG vectors", () => {
  const logosDir = path.resolve(process.cwd(), "public/plugins/logos");
  assert.ok(
    fs.existsSync(logosDir),
    "public/plugins/logos directory must exist",
  );

  for (const file of REQUIRED_LOGOS) {
    const filePath = path.join(logosDir, file);
    assert.ok(fs.existsSync(filePath), `Logo file missing: ${file}`);
    const content = fs.readFileSync(filePath, "utf-8").trim();
    assert.ok(content.startsWith("<svg"), `${file} must start with <svg`);
    assert.ok(content.endsWith("</svg>"), `${file} must end with </svg>`);
    assert.ok(
      content.length > 100,
      `${file} content is too small to be a valid logo`,
    );
  }
});
