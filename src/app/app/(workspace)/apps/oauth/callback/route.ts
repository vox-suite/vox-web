import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { CoreHostRequestError } from "@/lib/consumer-auth/core-host-client";
import { connectedAppsRedirectUri } from "@/lib/consumer-auth/connected-apps";
import { consumerHref } from "@/lib/consumer-routes";

/**
 * Where an app's OAuth sign-in returns. Core checks that the single-use
 * state belongs to this signed-in account before exchanging the code.
 */
export async function GET(request: NextRequest) {
  const canonical = new URL(connectedAppsRedirectUri(request));
  const host = canonical.host;
  const back = (params: Record<string, string>) => {
    const url = new URL(consumerHref(host, "/apps"), canonical.origin);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  };

  const account = await currentConsumer(request.headers);
  if (!account) {
    const login = new URL(consumerHref(host, "/"), canonical.origin);
    return NextResponse.redirect(login);
  }

  const params = request.nextUrl.searchParams;
  const providerError = params.get("error");
  if (providerError) {
    return back({
      connect_error:
        providerError === "access_denied"
          ? "access_denied"
          : "provider_rejected",
    });
  }
  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) {
    return back({ connect_error: "invalid_request" });
  }

  const core = getCoreHostClient();
  if (!core) {
    return back({ connect_error: "not_configured" });
  }
  try {
    const setup = await core.completeConnectorSetup(
      account.accountId,
      state,
      code,
      params.get("iss"),
    );
    return back({
      authorization_complete: setup.external_key,
      setup_result: setup.state,
    });
  } catch (error) {
    const reason =
      error instanceof CoreHostRequestError && error.code
        ? error.code
        : "unknown";
    return back({ connect_error: reason });
  }
}
