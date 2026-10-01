import { createClient } from "@/lib/supabase/server";
import { consumerHref } from "@/lib/consumer-routes";
import { NextResponse } from "next/server";

function redirectUrl(request: Request, path: string) {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  if (isLocalEnv) return `${origin}${path}`;
  if (forwardedHost) return `https://${forwardedHost}${path}`;
  return `${origin}${path}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const login = consumerHref(host, "/sign-in");

  if (!code) {
    return NextResponse.redirect(redirectUrl(request, `${login}?error=auth`));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(redirectUrl(request, `${login}?error=auth`));
  }

  return NextResponse.redirect(redirectUrl(request, next));
}
