import { createHmac, timingSafeEqual } from "node:crypto";

export { consumerDestination, consumerHref } from "./consumer-routes";

export function isSuperuser(
  email: string | null | undefined,
  allowlist: string | undefined,
) {
  if (!email || !allowlist) return false;
  return allowlist
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}
export function maySignIn(
  provider: string | undefined,
  profile: { email?: string; email_verified?: boolean } | undefined,
  allowlist: string | undefined,
) {
  return (
    provider === "google" &&
    profile?.email_verified === true &&
    isSuperuser(profile.email, allowlist)
  );
}

export function encodeAdminE2ESession(
  email: string,
  secret: string,
  googleVerified = true,
) {
  const payload = Buffer.from(
    JSON.stringify({ email, googleVerified }),
    "utf8",
  ).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function decodeAdminE2ESession(raw: string, secret: string) {
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right))
    return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string;
      googleVerified?: boolean;
    };
  } catch {
    return null;
  }
}

export function safeCallback(url: string, baseUrl: string) {
  const isSubdomain =
    new URL(baseUrl).hostname.toLowerCase() === "admin.voxagent.in";
  try {
    const target = new URL(url, baseUrl);
    if (target.origin === new URL(baseUrl).origin) {
      if (isSubdomain && /^\/admin(\/|$)/.test(target.pathname)) {
        target.pathname =
          target.pathname === "/admin" || target.pathname === "/admin/"
            ? "/"
            : target.pathname.replace(/^\/admin/, "");
      }
      return target.href;
    }
  } catch {}
  return isSubdomain ? `${baseUrl}/` : `${baseUrl}/admin`;
}
export function adminDestination(host: string, path: string) {
  if (host.toLowerCase().split(":")[0] !== "admin.voxagent.in") return null;
  if (/^\/(admin|auth|api|_next)(\/|$)/.test(path) || path.includes("."))
    return null;
  return path === "/" ? "/admin" : `/admin${path}`;
}

export function parseRedisQuery(params: URLSearchParams) {
  const cursor = params.get("cursor") ?? "0";
  const match = params.get("match") || "vox:*";
  if (!/^\d{1,20}$/.test(cursor) || BigInt(cursor) > 18446744073709551615n)
    throw new Error("Invalid cursor. Restart the search.");
  if (match.length > 256 || /[\x00-\x1f]/.test(match))
    throw new Error(
      "Search must be at most 256 characters without control characters.",
    );
  return { cursor, match };
}

export function canonicalAdminRedirect(
  host: string,
  path: string,
  origin: string | undefined,
) {
  if (!origin || !/^\/(admin|auth)(\/|$)/.test(path)) return null;
  try {
    const canonical = new URL(origin);
    if (
      canonical.protocol !== "https:" ||
      canonical.hostname !== "admin.voxagent.in"
    )
      return null;

    const normalizedHost = host.toLowerCase().split(":")[0];
    const isSubdomain = normalizedHost === canonical.hostname;

    if (isSubdomain) {
      if (/^\/admin(\/|$)/.test(path)) {
        const cleanPath =
          path === "/admin" || path === "/admin/"
            ? "/"
            : path.replace(/^\/admin/, "");
        return new URL(cleanPath, canonical.origin).href;
      }
      return null;
    }

    if (/^\/admin(\/|$)/.test(path)) {
      const cleanPath =
        path === "/admin" || path === "/admin/"
          ? "/"
          : path.replace(/^\/admin/, "");
      return new URL(cleanPath, canonical.origin).href;
    }

    return new URL(path, canonical.origin).href;
  } catch {
    return null;
  }
}
