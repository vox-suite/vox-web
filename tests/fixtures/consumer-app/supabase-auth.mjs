#!/usr/bin/env node
// Fake Supabase Auth (GoTrue) server for local consumer-app development.
//
// It speaks just enough of the GoTrue HTTP API for @supabase/ssr 0.12 and
// @supabase/auth-js 2.117 to treat a synthetic user as genuinely signed in:
//   GET  /auth/v1/user                         (getUser)
//   POST /auth/v1/token?grant_type=refresh_token
//   POST /auth/v1/logout?scope=global|local|others
//   POST /auth/v1/otp + POST /auth/v1/verify   (email code sign-in via the real form)
//   GET  /auth/v1/settings, /auth/v1/health, /auth/v1/.well-known/jwks.json
// plus a fixture-only convenience route:
//   GET  /fixture/sign-in?email=&name=&next=   sets the session cookie for host
//        127.0.0.1 (cookies ignore ports) and redirects to the app.
//
// Tokens are stateless HS256 JWTs signed with FIXTURE_JWT_SECRET, so cookies
// minted by the CLI keep working across server restarts. Sign-out revocations
// are held in memory.
//
// Usage:
//   node tests/fixtures/consumer-app/supabase-auth.mjs                 # serve on 54321
//   node tests/fixtures/consumer-app/supabase-auth.mjs cookie [--email a@b --name "A B"
//        --id <uuid> --provider google|email --ttl 28800 --format header|json|playwright|env]

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

export const DEFAULT_AUTH_PORT = 54321;
export const FIXTURE_JWT_SECRET =
  process.env.CONSUMER_FIXTURE_JWT_SECRET ??
  "consumer-fixture-jwt-secret-not-for-production-use";
export const FIXTURE_ANON_KEY = "consumer-fixture-anon-key";
export const FIXTURE_OTP_CODE =
  process.env.CONSUMER_FIXTURE_OTP_CODE ?? "123456";
export const DEFAULT_SESSION_TTL_SECONDS = 8 * 60 * 60;

/** The synthetic consumer used by default everywhere in the fixture. */
export const DEFAULT_USER = Object.freeze({
  id: "5f0c8a4e-2b1d-4c3a-9e7f-1a2b3c4d5e6f",
  email: "asha.raman@example.test",
  fullName: "Asha Raman",
  provider: "google",
});

// ---------------------------------------------------------------------------
// Token + cookie helpers (exported for Playwright / scripts)

const b64url = (value) => Buffer.from(value, "utf8").toString("base64url");

function hmac(input) {
  return createHmac("sha256", FIXTURE_JWT_SECRET)
    .update(input)
    .digest("base64url");
}

function signJwt(payload) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  return `${header}.${body}.${hmac(`${header}.${body}`)}`;
}

function verifySigned(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const expected = Buffer.from(hmac(`${parts[0]}.${parts[1]}`));
  const actual = Buffer.from(parts[2]);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
    return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/** Deterministic UUID-shaped id for an email, so the same email => same user. */
export function userIdForEmail(email) {
  if (email.toLowerCase() === DEFAULT_USER.email) return DEFAULT_USER.id;
  const h = createHmac("sha256", "consumer-fixture-user-id")
    .update(email.toLowerCase())
    .digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function normalizeUser(input = {}) {
  const email = (input.email ?? DEFAULT_USER.email).trim().toLowerCase();
  const fullName =
    input.fullName ??
    (email === DEFAULT_USER.email
      ? DEFAULT_USER.fullName
      : email
          .split("@")[0]
          .split(/[._-]+/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "));
  return {
    id: input.id ?? userIdForEmail(email),
    email,
    fullName,
    provider: input.provider ?? DEFAULT_USER.provider,
  };
}

/** Build the GoTrue user object returned by GET /auth/v1/user. */
export function userObject(claims) {
  const created = new Date(1_767_225_600_000).toISOString(); // 2026-01-01
  const provider = claims.app_metadata?.provider ?? "email";
  return {
    id: claims.sub,
    aud: "authenticated",
    role: "authenticated",
    email: claims.email,
    email_confirmed_at: created,
    phone: "",
    confirmed_at: created,
    last_sign_in_at: new Date((claims.iat ?? 0) * 1000).toISOString(),
    app_metadata: claims.app_metadata,
    user_metadata: claims.user_metadata,
    identities: [
      {
        identity_id: `${claims.sub}-${provider}`,
        id: claims.sub,
        user_id: claims.sub,
        provider,
        identity_data: {
          email: claims.email,
          email_verified: true,
          sub: claims.sub,
          full_name: claims.user_metadata?.full_name,
        },
        email: claims.email,
        created_at: created,
        updated_at: created,
        last_sign_in_at: created,
      },
    ],
    created_at: created,
    updated_at: created,
    is_anonymous: false,
  };
}

/**
 * Mint a Supabase session object for a synthetic user.
 * @param {{id?: string, email?: string, fullName?: string, provider?: "google"|"email", ttlSeconds?: number, sessionId?: string}} [input]
 */
export function mintSession(input = {}) {
  const user = normalizeUser(input);
  const now = Math.floor(Date.now() / 1000);
  const ttl = input.ttlSeconds ?? DEFAULT_SESSION_TTL_SECONDS;
  const sessionId = input.sessionId ?? randomUUID();
  const claims = {
    iss: `fixture-supabase-auth`,
    sub: user.id,
    aud: "authenticated",
    exp: now + ttl,
    iat: now,
    iat_ms: Date.now(),
    email: user.email,
    phone: "",
    role: "authenticated",
    aal: "aal1",
    session_id: sessionId,
    is_anonymous: false,
    app_metadata: {
      provider: user.provider,
      providers: [user.provider],
    },
    user_metadata: {
      email: user.email,
      email_verified: true,
      full_name: user.fullName,
      name: user.fullName,
      sub: user.id,
    },
  };
  const refreshToken = signJwt({
    typ: "refresh",
    sub: user.id,
    session_id: sessionId,
    nonce: randomUUID(),
    iat: now,
    iat_ms: Date.now(),
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      provider: user.provider,
    },
    ttl,
  });
  return {
    access_token: signJwt(claims),
    token_type: "bearer",
    expires_in: ttl,
    expires_at: now + ttl,
    refresh_token: refreshToken,
    user: userObject(claims),
  };
}

/** Storage key @supabase/supabase-js derives: `sb-${hostname.split(".")[0]}-auth-token`. */
export function storageKeyFor(supabaseUrl) {
  return `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
}

const MAX_CHUNK_SIZE = 3180; // @supabase/ssr utils/chunker.js

/**
 * Cookies exactly as @supabase/ssr (cookieEncoding "base64url") writes them:
 * value = "base64-" + base64url(JSON.stringify(session)), split into
 * `<key>.0`, `<key>.1`, ... when longer than 3180 URI-encoded characters.
 * base64url output is URI-safe, so plain slicing matches the ssr chunker.
 */
export function sessionCookies(
  session,
  supabaseUrl = `http://127.0.0.1:${DEFAULT_AUTH_PORT}`,
) {
  const key = storageKeyFor(supabaseUrl);
  const value = `base64-${b64url(JSON.stringify(session))}`;
  if (value.length <= MAX_CHUNK_SIZE) return [{ name: key, value }];
  const chunks = [];
  for (let i = 0; i * MAX_CHUNK_SIZE < value.length; i++) {
    chunks.push({
      name: `${key}.${i}`,
      value: value.slice(i * MAX_CHUNK_SIZE, (i + 1) * MAX_CHUNK_SIZE),
    });
  }
  return chunks;
}

/** Cookies in Playwright `context.addCookies()` shape. */
export function playwrightCookies(
  input = {},
  {
    supabaseUrl = `http://127.0.0.1:${DEFAULT_AUTH_PORT}`,
    domain = "127.0.0.1",
  } = {},
) {
  const session = mintSession(input);
  return sessionCookies(session, supabaseUrl).map((cookie) => ({
    ...cookie,
    domain,
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
    expires: session.expires_at + 400 * 24 * 60 * 60,
  }));
}

/** `Cookie:` request header value (for curl / fetch). */
export function cookieHeader(input = {}, supabaseUrl) {
  return sessionCookies(mintSession(input), supabaseUrl)
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
}

// ---------------------------------------------------------------------------
// Server

const revokedSessions = new Set();
const revokedSubjectsBefore = new Map(); // sub -> ms cutoff (global sign-out)

function isRevoked(claims) {
  if (revokedSessions.has(claims.session_id)) return true;
  const cutoff = revokedSubjectsBefore.get(claims.sub);
  return cutoff !== undefined && (claims.iat_ms ?? claims.iat * 1000) <= cutoff;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
  "Access-Control-Expose-Headers": "x-supabase-api-version",
};

function send(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    ...CORS_HEADERS,
    "x-supabase-api-version": "2024-01-01",
    ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    ...extraHeaders,
  });
  response.end(body === undefined ? undefined : JSON.stringify(body));
}

function authError(response, status, code, message) {
  send(response, status, {
    code,
    error_code: code,
    message,
    msg: message,
  });
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

function bearerClaims(request) {
  const header = request.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const claims = verifySigned(token);
  if (!claims || claims.typ === "refresh") return { error: "bad_jwt" };
  if (claims.exp * 1000 < Date.now())
    return { error: "bad_jwt", expired: true };
  if (isRevoked(claims)) return { error: "session_not_found" };
  return { claims };
}

function log(...args) {
  if (process.env.CONSUMER_FIXTURE_QUIET !== "1")
    console.log("[fixture-auth]", ...args);
}

/**
 * Start the fake Supabase Auth server.
 * @param {{port?: number, host?: string, appOrigin?: string}} [options]
 */
export function startSupabaseAuth({
  port = Number(process.env.CONSUMER_FIXTURE_AUTH_PORT ?? DEFAULT_AUTH_PORT),
  host = "127.0.0.1",
  appOrigin = process.env.CONSUMER_FIXTURE_APP_ORIGIN ??
    "http://127.0.0.1:3200",
} = {}) {
  const supabaseUrl = `http://${host}:${port}`;
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", supabaseUrl);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (request.method === "OPTIONS") return send(response, 204);

    if (path === "/health" || path === "/auth/v1/health") {
      return send(response, 200, {
        name: "GoTrue (consumer fixture)",
        version: "fixture",
      });
    }
    if (path === "/auth/v1/settings") {
      return send(response, 200, {
        external: { google: true, email: true },
        disable_signup: false,
        mailer_autoconfirm: true,
        phone_autoconfirm: false,
        sms_provider: "",
      });
    }
    if (path === "/auth/v1/.well-known/jwks.json") {
      // HS256 tokens: supabase-js falls back to getUser() for claims.
      return send(response, 200, { keys: [] });
    }

    if (path === "/auth/v1/user" && request.method === "GET") {
      const { claims, error } = bearerClaims(request);
      if (error) {
        log("GET /user rejected:", error);
        return authError(
          response,
          403,
          error,
          error === "session_not_found"
            ? "Session from session_id claim in JWT does not exist"
            : "invalid JWT: unable to parse or verify signature",
        );
      }
      return send(response, 200, userObject(claims));
    }

    if (path === "/auth/v1/token" && request.method === "POST") {
      const grantType = url.searchParams.get("grant_type");
      const body = await readJson(request);
      if (grantType === "refresh_token") {
        const claims = verifySigned(body.refresh_token);
        if (!claims || claims.typ !== "refresh" || isRevoked(claims)) {
          return authError(
            response,
            400,
            "refresh_token_not_found",
            "Invalid Refresh Token: Refresh Token Not Found",
          );
        }
        log("refresh for", claims.user.email);
        return send(
          response,
          200,
          mintSession({
            ...claims.user,
            ttlSeconds: claims.ttl,
            sessionId: claims.session_id,
          }),
        );
      }
      if (grantType === "password") {
        if (body.password !== FIXTURE_OTP_CODE || !body.email) {
          return authError(
            response,
            400,
            "invalid_credentials",
            "Invalid login credentials",
          );
        }
        return send(
          response,
          200,
          mintSession({ email: body.email, provider: "email" }),
        );
      }
      return authError(
        response,
        400,
        "validation_failed",
        `Unsupported grant_type in consumer fixture: ${grantType}`,
      );
    }

    if (path === "/auth/v1/logout" && request.method === "POST") {
      const { claims } = bearerClaims(request);
      const scope = url.searchParams.get("scope") ?? "global";
      if (claims) {
        if (scope === "global") {
          revokedSubjectsBefore.set(claims.sub, Date.now());
        } else if (scope === "local") {
          revokedSessions.add(claims.session_id);
        }
        // "others" keeps the current session; stateless tokens cannot
        // enumerate sibling sessions, so it is a no-op here.
        log(`logout scope=${scope} for`, claims.email);
      }
      return send(response, 204);
    }

    if (path === "/auth/v1/otp" && request.method === "POST") {
      const body = await readJson(request);
      log(
        `OTP requested for ${body.email ?? "(none)"}; fixture code is ${FIXTURE_OTP_CODE}`,
      );
      return send(response, 200, {});
    }

    if (path === "/auth/v1/verify" && request.method === "POST") {
      const body = await readJson(request);
      if (!body.email || body.token !== FIXTURE_OTP_CODE) {
        return authError(
          response,
          403,
          "otp_expired",
          "Token has expired or is invalid",
        );
      }
      return send(
        response,
        200,
        mintSession({ email: body.email, provider: "email" }),
      );
    }

    if (path === "/fixture/sign-in" && request.method === "GET") {
      const email = url.searchParams.get("email") ?? DEFAULT_USER.email;
      const name = url.searchParams.get("name") ?? undefined;
      const next = url.searchParams.get("next") ?? "/app";
      const target = new URL(next, appOrigin);
      const cookies = sessionCookies(
        mintSession({ email, fullName: name }),
        supabaseUrl,
      ).map(
        ({ name: cookieName, value }) =>
          `${cookieName}=${value}; Path=/; SameSite=Lax; Max-Age=34560000`,
      );
      log("fixture sign-in for", email);
      response.writeHead(302, {
        Location: target.toString(),
        "Set-Cookie": cookies,
        "Cache-Control": "no-store",
      });
      return response.end();
    }

    if (path === "/fixture/cookie" && request.method === "GET") {
      const email = url.searchParams.get("email") ?? DEFAULT_USER.email;
      const session = mintSession({ email });
      return send(response, 200, {
        cookies: sessionCookies(session, supabaseUrl),
        user: session.user,
      });
    }

    log(`unhandled ${request.method} ${url.pathname}`);
    return authError(
      response,
      404,
      "not_found",
      `Consumer fixture does not implement ${request.method} ${url.pathname}`,
    );
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      log(`listening on ${supabaseUrl}`);
      resolve(server);
    });
  });
}

// ---------------------------------------------------------------------------
// CLI

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) args[key] = true;
      else {
        args[key] = next;
        i++;
      }
    } else (args._ ??= []).push(arg);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._?.[0] ?? "serve";
  if (command === "serve") {
    await startSupabaseAuth({
      port: args.port ? Number(args.port) : undefined,
    });
    return;
  }
  if (command === "cookie") {
    const supabaseUrl =
      args["supabase-url"] ??
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      `http://127.0.0.1:${DEFAULT_AUTH_PORT}`;
    const input = {
      email: args.email,
      fullName: args.name,
      id: args.id,
      provider: args.provider,
      ttlSeconds: args.ttl ? Number(args.ttl) : undefined,
    };
    const format = args.format ?? "header";
    if (format === "playwright") {
      console.log(
        JSON.stringify(playwrightCookies(input, { supabaseUrl }), null, 2),
      );
    } else {
      const session = mintSession(input);
      const cookies = sessionCookies(session, supabaseUrl);
      if (format === "json") {
        console.log(
          JSON.stringify({ cookies, user: session.user, session }, null, 2),
        );
      } else if (format === "env") {
        console.log(
          `CONSUMER_COOKIE='${cookies.map((c) => `${c.name}=${c.value}`).join("; ")}'`,
        );
      } else {
        console.log(cookies.map((c) => `${c.name}=${c.value}`).join("; "));
      }
    }
    return;
  }
  console.error(`Unknown command ${command}. Use "serve" or "cookie".`);
  process.exit(2);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
