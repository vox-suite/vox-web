import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { CoreHostRequestError } from "@/lib/consumer-auth/core-host-client";
import { consumerHref } from "@/lib/consumer-routes";

/**
 * Where an app's OAuth sign-in returns. Core checks that the single-use
 * state belongs to this signed-in account before exchanging the code.
 */
export async function GET(request: NextRequest) {
  const host = request.headers.get("host");
  const back = (params: Record<string, string>) => {
    const url = new URL(consumerHref(host, "/apps"), request.nextUrl.origin);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  };

  const account = await currentConsumer(request.headers);
  if (!account) {
    const login = new URL(consumerHref(host, "/"), request.nextUrl.origin);
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
    const extension = await core.completeConnection(
      account.accountId,
      state,
      code,
    );
    return back({ connected: extension.external_key });
  } catch (error) {
    const reason =
      error instanceof CoreHostRequestError && error.code
        ? error.code
        : "unknown";
    return back({ connect_error: reason });
  }
}
