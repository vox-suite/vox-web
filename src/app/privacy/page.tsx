import { Section, Stack, Text, LinkButton, Brand } from "@/components/ui";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() {
  return (
    <main id="main">
      <Section>
        <Stack gap="large">
          <Brand />
          <h1>Privacy at Vox</h1>
          <Text muted>
            This page describes the website and administration area available
            today.
          </Text>
          <h2>Public website</h2>
          <Text>
            The public website presents the Vox vision. Its conversation
            examples are illustrative. It does not start calls, record your
            microphone, or connect your accounts.
          </Text>
          <h2>Administration sign-in</h2>
          <Text>
            Administrators sign in through Google. We use your verified email to
            check an explicit access list, and your name and email to identify
            your session. An encrypted, HTTP-only session cookie keeps you
            signed in for up to eight hours. The website does not receive your
            Google password.
          </Text>
          <h2>Administrative data</h2>
          <Text>
            Authorized administrators can view internal Redis data, which may
            include personal context. These responses are marked private and are
            not cached by the application. Administrators should only access
            information needed for their work.
          </Text>
          <h2>Service providers</h2>
          <Text>
            Google processes sign-in requests. Hosting infrastructure may retain
            standard request logs. This page does not specify retention periods
            for the separate Vox voice service or its databases.
          </Text>
          <LinkButton href="/" variant="secondary">
            Back to Vox
          </LinkButton>
        </Stack>
      </Section>
    </main>
  );
}
