import assert from "node:assert/strict";
import test from "node:test";
import {
  isSuperuser,
  maySignIn,
  safeCallback,
  adminDestination,
  parseRedisQuery,
} from "../src/lib/access";

test("superuser access is exact, case-insensitive, and fails closed", () => {
  assert.equal(isSuperuser("owner@example.com", ""), false);
  assert.equal(isSuperuser(undefined, "owner@example.com"), false);
  assert.equal(
    isSuperuser("OWNER@example.com", " owner@example.com, second@example.com "),
    true,
  );
  assert.equal(
    isSuperuser("owner@example.com.evil.test", "owner@example.com"),
    false,
  );
});
test("only verified Google profiles may authenticate", () => {
  assert.equal(
    maySignIn(
      "google",
      { email: "owner@example.com", email_verified: true },
      "owner@example.com",
    ),
    true,
  );
  assert.equal(
    maySignIn(
      "google",
      { email: "owner@example.com", email_verified: false },
      "owner@example.com",
    ),
    false,
  );
  assert.equal(
    maySignIn(
      "other",
      { email: "owner@example.com", email_verified: true },
      "owner@example.com",
    ),
    false,
  );
  assert.equal(
    maySignIn(
      "google",
      { email: "other@example.com", email_verified: true },
      "owner@example.com",
    ),
    false,
  );
});
test("callbacks cannot leave the application", () => {
  assert.equal(
    safeCallback("https://evil.test", "https://admin.voxagent.in"),
    "https://admin.voxagent.in/",
  );
  assert.equal(
    safeCallback("//evil.test", "https://admin.voxagent.in"),
    "https://admin.voxagent.in/",
  );
  assert.equal(
    safeCallback("/admin/redis", "https://admin.voxagent.in"),
    "https://admin.voxagent.in/redis",
  );
  assert.equal(
    safeCallback("/redis", "https://admin.voxagent.in"),
    "https://admin.voxagent.in/redis",
  );
  assert.equal(
    safeCallback("/\\evil.test", "https://admin.voxagent.in"),
    "https://admin.voxagent.in/",
  );
  assert.equal(
    safeCallback("https://evil.test", "http://localhost:3000"),
    "http://localhost:3000/admin",
  );
});
test("subdomain routing only rewrites the exact admin host", () => {
  assert.equal(adminDestination("admin.voxagent.in", "/"), "/admin");
  assert.equal(adminDestination("admin.voxagent.in", "/redis"), "/admin/redis");
  assert.equal(adminDestination("admin.voxagent.in", "/login"), "/admin/login");
  assert.equal(adminDestination("admin.voxagent.in", "/api/admin/redis"), null);
  assert.equal(adminDestination("admin.voxagent.in", "/admin"), null);
  assert.equal(adminDestination("admin.voxagent.in", "/admin/login"), null);
  assert.equal(adminDestination("admin.voxagent.in.evil.test", "/"), null);
  assert.equal(adminDestination("voxagent.in", "/"), null);
});
test("Redis query validation preserves uint64 cursors without number rounding", () => {
  assert.deepEqual(
    parseRedisQuery(
      new URLSearchParams("cursor=18446744073709551615&match=vox:*"),
    ),
    { cursor: "18446744073709551615", match: "vox:*" },
  );
  assert.throws(() => parseRedisQuery(new URLSearchParams("cursor=-1")));
  assert.throws(() =>
    parseRedisQuery(new URLSearchParams("cursor=18446744073709551616")),
  );
  assert.throws(() =>
    parseRedisQuery(new URLSearchParams({ match: "x".repeat(257) })),
  );
});

test("public-domain admin entry uses the OAuth cookie host", async () => {
  const { canonicalAdminRedirect } = await import("../src/lib/access");
  assert.equal(
    canonicalAdminRedirect(
      "voxagent.in",
      "/admin/login",
      "https://admin.voxagent.in",
    ),
    "https://admin.voxagent.in/login",
  );
  assert.equal(
    canonicalAdminRedirect(
      "voxagent.in",
      "/admin",
      "https://admin.voxagent.in",
    ),
    "https://admin.voxagent.in/",
  );
  assert.equal(
    canonicalAdminRedirect("voxagent.in", "/", "https://admin.voxagent.in"),
    null,
  );
  assert.equal(
    canonicalAdminRedirect(
      "admin.voxagent.in",
      "/admin/login",
      "https://admin.voxagent.in",
    ),
    "https://admin.voxagent.in/login",
  );
  assert.equal(
    canonicalAdminRedirect(
      "admin.voxagent.in",
      "/admin",
      "https://admin.voxagent.in",
    ),
    "https://admin.voxagent.in/",
  );
  assert.equal(
    canonicalAdminRedirect(
      "admin.voxagent.in",
      "/login",
      "https://admin.voxagent.in",
    ),
    null,
  );
  assert.equal(
    canonicalAdminRedirect(
      "localhost:3000",
      "/admin/login",
      "http://localhost:3000",
    ),
    null,
  );
});
