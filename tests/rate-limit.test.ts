import assert from "node:assert/strict";
import test from "node:test";
import {
  checkRateLimit,
  clearRateLimits,
  getClientIp,
} from "../src/lib/rate-limit";

test("getClientIp extracts client IP with proper precedence and fallback", () => {
  const req1 = new Request("http://localhost", {
    headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
  });
  assert.equal(getClientIp(req1), "203.0.113.195");

  const req2 = new Request("http://localhost", {
    headers: { "x-real-ip": "198.51.100.1" },
  });
  assert.equal(getClientIp(req2), "198.51.100.1");

  const req3 = new Request("http://localhost", {
    headers: { "cf-connecting-ip": "192.0.2.1" },
  });
  assert.equal(getClientIp(req3), "192.0.2.1");

  const req4 = new Request("http://localhost");
  assert.equal(getClientIp(req4), "127.0.0.1");
});

test("rate limiting allows requests within limit and rejects once exceeded", () => {
  clearRateLimits();
  const ip = "192.168.1.10";
  const limit = 3;
  const windowMs = 10_000;

  const r1 = checkRateLimit(ip, "/api/admin/health", { limit, windowMs });
  assert.equal(r1.success, true);
  assert.equal(r1.limit, 3);
  assert.equal(r1.remaining, 2);

  const r2 = checkRateLimit(ip, "/api/admin/health", { limit, windowMs });
  assert.equal(r2.success, true);
  assert.equal(r2.remaining, 1);

  const r3 = checkRateLimit(ip, "/api/admin/health", { limit, windowMs });
  assert.equal(r3.success, true);
  assert.equal(r3.remaining, 0);

  const r4 = checkRateLimit(ip, "/api/admin/health", { limit, windowMs });
  assert.equal(r4.success, false);
  assert.equal(r4.remaining, 0);
  assert.ok(r4.retryAfter && r4.retryAfter > 0);

  const other = checkRateLimit("192.168.1.20", "/api/admin/health", {
    limit,
    windowMs,
  });
  assert.equal(other.success, true);
  assert.equal(other.remaining, 2);
});

test("auth endpoints bucket separately from general traffic", () => {
  clearRateLimits();
  const ip = "10.0.0.1";
  const limit = 2;
  const windowMs = 10_000;

  checkRateLimit(ip, "/auth/callback", { limit, windowMs });
  checkRateLimit(ip, "/auth/callback", { limit, windowMs });
  const authBlocked = checkRateLimit(ip, "/auth/callback", {
    limit,
    windowMs,
  });
  assert.equal(authBlocked.success, false);

  const general = checkRateLimit(ip, "/admin/health", { limit, windowMs });
  assert.equal(general.success, true);
});
