/**
 * Consumer app URL scheme. On the dedicated host (app.voxagent.in) routes are
 * served without the `/app` prefix via a proxy rewrite; everywhere else
 * (local development, previews) they live under `/app`. Client-safe.
 */
export const CONSUMER_HOST = "app.voxagent.in";

function normalizeHost(host: string | null | undefined) {
  return host?.toLowerCase().split(":")[0] ?? "";
}

export function isConsumerHost(host: string | null | undefined) {
  return normalizeHost(host) === CONSUMER_HOST;
}

export function consumerDestination(host: string, path: string) {
  if (!isConsumerHost(host)) return null;
  if (/^\/(app|admin|auth|api|_next)(\/|$)/.test(path) || path.includes("."))
    return null;
  return path === "/" ? "/app" : `/app${path}`;
}

/** Base path for in-app links: "" on the consumer host, "/app" elsewhere. */
export function consumerBasePath(host: string | null | undefined) {
  return isConsumerHost(host) ? "" : "/app";
}

export function consumerHref(host: string | null | undefined, path: string) {
  return isConsumerHost(host) ? path : `/app${path}`;
}
