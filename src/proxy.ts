import { NextResponse, type NextRequest } from "next/server";
import {
  adminDestination,
  canonicalAdminRedirect,
  consumerDestination,
} from "./lib/access";
import { checkRateLimit, getClientIp } from "./lib/rate-limit";

export function proxy(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimitResult = checkRateLimit(ip, request.nextUrl.pathname);

  if (!rateLimitResult.success) {
    const isApi = request.nextUrl.pathname.startsWith("/api/");
    const body = isApi
      ? JSON.stringify({ error: "Too many requests. Please try again later." })
      : "Too many requests. Please try again later.";
    return new NextResponse(body, {
      status: 429,
      headers: {
        "Content-Type": isApi
          ? "application/json"
          : "text/plain; charset=utf-8",
        "Retry-After": String(rateLimitResult.retryAfter),
        "X-RateLimit-Limit": String(rateLimitResult.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(rateLimitResult.reset),
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  }

  const canonical = canonicalAdminRedirect(
    request.headers.get("host") ?? "",
    request.nextUrl.pathname,
    process.env.VOX_ADMIN_ORIGIN,
  );
  if (canonical) {
    const response = NextResponse.redirect(canonical + request.nextUrl.search);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    response.headers.set(
      "X-RateLimit-Remaining",
      String(rateLimitResult.remaining),
    );
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.reset));
    return response;
  }
  const adminPath = adminDestination(
    request.headers.get("host") ?? "",
    request.nextUrl.pathname,
  );
  const consumerPath = consumerDestination(
    request.headers.get("host") ?? "",
    request.nextUrl.pathname,
  );
  const path = adminPath ?? consumerPath;
  const response = path
    ? NextResponse.rewrite(new URL(path + request.nextUrl.search, request.url))
    : NextResponse.next();
  if (
    path ||
    /^\/(admin|app|api\/admin|auth|api\/account)(\/|$)/.test(
      request.nextUrl.pathname,
    )
  ) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
  response.headers.set(
    "X-RateLimit-Remaining",
    String(rateLimitResult.remaining),
  );
  response.headers.set("X-RateLimit-Reset", String(rateLimitResult.reset));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
