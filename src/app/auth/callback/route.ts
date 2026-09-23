import { createClient } from "@/lib/supabase/server";
import { isSuperuser } from "@/lib/access";
import { adminLoginPath } from "@/lib/auth";
import { NextResponse } from "next/server";

function redirectUrl(request: Request, path: string) {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  if (isLocalEnv) return `${origin}${path}`;
  if (forwardedHost) return `https://${forwardedHost}${path}`;
  return `${origin}${path}`;
}

function isAdminNext(next: string, host: string | null) {
  const hostname = host?.toLowerCase().split(":")[0];
  if (hostname === "admin.voxagent.in") {
    return next === "/" || next.startsWith("/?") || !next.startsWith("/app");
  }
  return next === "/admin" || next.startsWith("/admin/");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const login = adminLoginPath(host);

  if (!code) {
    return NextResponse.redirect(redirectUrl(request, `${login}?error=auth`));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(redirectUrl(request, `${login}?error=auth`));
  }

  if (isAdminNext(next, host)) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const email = user?.email;
    const verified =
      user?.email_confirmed_at != null ||
      user?.app_metadata?.provider === "google";
    if (!email || !verified || !isSuperuser(email, process.env.SUPERUSER_EMAILS)) {
      await supabase.auth.signOut();
      return NextResponse.redirect(redirectUrl(request, `${login}?error=auth`));
    }
  }

  return NextResponse.redirect(redirectUrl(request, next));
}
