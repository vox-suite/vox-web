"use client";

import { supabase } from "@/lib/consumer-auth/client";

export type SignOutScope = "local" | "global";

/** Ends the Supabase session, then leaves the app so no cached account data survives. */
export async function signOut(scope: SignOutScope, signInHref: string) {
  await supabase.auth.signOut(
    scope === "global" ? { scope: "global" } : undefined,
  );
  window.location.assign(signInHref);
}

export async function linkGoogleIdentity(basePath: string) {
  return supabase.auth.linkIdentity({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${basePath || "/"}`,
    },
  });
}
