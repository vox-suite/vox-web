import { NextResponse, type NextRequest } from "next/server";
import { adminDestination, canonicalAdminRedirect } from "./lib/access";
export function proxy(request: NextRequest) {
  const canonical = canonicalAdminRedirect(
    request.headers.get("host") ?? "",
    request.nextUrl.pathname,
    process.env.NEXTAUTH_URL,
  );
  if (canonical) {
    const response = NextResponse.redirect(canonical + request.nextUrl.search);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  const path = adminDestination(
    request.headers.get("host") ?? "",
    request.nextUrl.pathname,
  );
  const response = path
    ? NextResponse.rewrite(new URL(path + request.nextUrl.search, request.url))
    : NextResponse.next();
  if (
    path ||
    /^\/(admin|api\/admin|api\/auth)(\/|$)/.test(request.nextUrl.pathname)
  ) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
