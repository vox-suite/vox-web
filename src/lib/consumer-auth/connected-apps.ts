import type { NextRequest } from "next/server";
import { consumerHref } from "@/lib/consumer-routes";

/**
 * The OAuth callback URL for connected apps. It must exactly match an entry
 * in Core's `VOX_MCP_OAUTH_REDIRECT_URIS`, which is what stops a forged host
 * header from redirecting authorization codes elsewhere.
 */
export function connectedAppsRedirectUri(request: NextRequest): string {
  const configured = process.env.VOX_CONNECTED_APPS_REDIRECT_URI?.trim();
  if (configured) return configured;
  const host = request.headers.get("host");
  return `${request.nextUrl.origin}${consumerHref(host, "/apps/oauth/callback")}`;
}

export { connectErrorMessage } from "./connected-apps-messages";
