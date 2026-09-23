import { ConsumerSignInForm } from "@/components/consumer/sign-in-form";
import { AuthFrame, Badge, Notice, Stack, Text } from "@/components/ui";
import { readConsumerAuthConfig } from "@/lib/consumer-auth/config";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { consumerHref } from "@/lib/access";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConsumerSignInPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  if (await currentConsumer(requestHeaders)) redirect(consumerHref(host, "/"));

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const config = readConsumerAuthConfig();
  const enabled = supabaseConfigured || (config.enabled && config.entryEnabled);

  return (
    <AuthFrame
      brandHref="https://voxagent.in"
      footer="Vox account · Private by default"
    >
      <Stack gap="large">
        <Stack>
          <Badge tone="accent">Your Vox account</Badge>
          <h1>Pick up where you left off.</h1>
          <Text muted>
            Sign in with Google or a single-use email code. Your connected
            services and approvals remain under your control.
          </Text>
        </Stack>
        {!enabled && (
          <Notice title="Sign-in is temporarily unavailable">
            Existing sessions can still be signed out. Please try again later.
          </Notice>
        )}
        <ConsumerSignInForm enabled={enabled} />
      </Stack>
    </AuthFrame>
  );
}
