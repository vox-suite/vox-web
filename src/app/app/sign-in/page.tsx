import { ConsumerSignInForm } from "@/features/account/components/sign-in-form";
import { SignInShell } from "@/features/account/components/sign-in-shell";
import { Notice } from "@/components/ui";
import { readConsumerAuthConfig } from "@/lib/consumer-auth/config";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { consumerHref } from "@/lib/access";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** A misconfigured legacy auth stack must show the unavailable notice, not crash the page. */
function legacyEntryEnabled() {
  try {
    const config = readConsumerAuthConfig();
    return config.enabled && config.entryEnabled;
  } catch (error) {
    console.error("Consumer sign-in config is invalid", error);
    return false;
  }
}

export default async function ConsumerSignInPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  if (await currentConsumer(requestHeaders)) redirect(consumerHref(host, "/"));

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const enabled = supabaseConfigured || legacyEntryEnabled();

  return (
    <SignInShell
      brandHref="https://voxagent.in"
      notice={
        enabled ? null : (
          <Notice title="Sign-in is temporarily unavailable">
            Existing sessions can still be signed out. Please try again later.
          </Notice>
        )
      }
    >
      <ConsumerSignInForm enabled={enabled} />
    </SignInShell>
  );
}
