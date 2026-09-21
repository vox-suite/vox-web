import { type NextRequest } from "next/server";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
};

export type RateLimitOptions = {
  limit?: number;
  windowMs?: number;
};

const store = new Map<string, number[]>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;
const MAX_STORE_SIZE = 10_000;

export function getClientIp(request: Request | NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp?.trim()) return cfConnectingIp.trim();
  if ("ip" in request && typeof request.ip === "string" && request.ip.trim()) {
    return request.ip.trim();
  }
  return "127.0.0.1";
}

function cleanupExpired(now: number, windowMs: number) {
  const cutoff = now - windowMs;
  for (const [key, timestamps] of store.entries()) {
    const last = timestamps[timestamps.length - 1];
    if (!last || last <= cutoff) {
      store.delete(key);
    }
  }
  lastCleanup = now;
}

export function checkRateLimit(
  key: string,
  pathname?: string,
  options?: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const envLimit = process.env.RATE_LIMIT_MAX
    ? parseInt(process.env.RATE_LIMIT_MAX, 10)
    : undefined;
  const envWindow = process.env.RATE_LIMIT_WINDOW_MS
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
    : undefined;

  const windowMs = options?.windowMs ?? envWindow ?? 60_000;
  const limit = options?.limit ?? envLimit ?? 100;

  if (now - lastCleanup > CLEANUP_INTERVAL_MS || store.size > MAX_STORE_SIZE) {
    cleanupExpired(now, windowMs);
  }

  // Segment by pathname prefix if needed, e.g. auth vs general
  const bucketKey = pathname?.startsWith("/api/auth")
    ? `auth:${key}`
    : `global:${key}`;

  let timestamps = store.get(bucketKey);
  if (!timestamps) {
    timestamps = [];
    store.set(bucketKey, timestamps);
  }

  const cutoff = now - windowMs;
  while (timestamps.length > 0 && timestamps[0] <= cutoff) {
    timestamps.shift();
  }

  if (timestamps.length >= limit) {
    const oldest = timestamps[0] ?? now;
    const resetTime = oldest + windowMs;
    const retryAfter = Math.max(1, Math.ceil((resetTime - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(resetTime / 1000),
      retryAfter,
    };
  }

  timestamps.push(now);
  const oldest = timestamps[0] ?? now;
  const resetTime = oldest + windowMs;
  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - timestamps.length),
    reset: Math.ceil(resetTime / 1000),
  };
}

export function clearRateLimits() {
  store.clear();
  lastCleanup = Date.now();
}
