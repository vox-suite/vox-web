import { Section, Stack, Text, LinkButton, Brand } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Compliance",
  description:
    "Privacy policy, security commitments, and legal compliance disclosures for Vox.",
};

export default function PrivacyPage() {
  return (
    <main id="main">
      <Section>
        <Stack gap="large">
          <Brand />
          <h1>Privacy & Legal Disclosures</h1>
          <Text muted>
            Last updated: September 2026. This page describes how Vox protects
            your data, complies with applicable privacy laws, and operates its
            telephony and web interfaces.
          </Text>

          <h2>1. Public Website & Telephony</h2>
          <Text>
            The public website introduces the Vox product. Fonts are self-hosted
            locally at build time without third-party IP leakage. The website does
            not activate your microphone, initiate calls, or inspect accounts
            without your explicit action.
          </Text>

          <h2>2. Children&apos;s Privacy (COPPA Compliance)</h2>
          <Text>
            Vox is directed to business professionals and is strictly not intended
            for children under the age of 13. We do not knowingly collect or
            maintain personal information from persons under 13 years of age.
            If we learn that personal data of persons under 13 has been collected
            without verified parental consent, we will promptly delete that
            information. Contact{" "}
            <a href="mailto:privacy@voxagent.in">privacy@voxagent.in</a> with any
            inquiries.
          </Text>

          <h2>3. Session Replay & Wiretapping Protection (CIPA)</h2>
          <Text>
            We respect your privacy. Vox does not employ invasive session-replay
            software or keystroke trackers that record sensitive form inputs or
            private browsing behavior without consent. Telemetry is anonymized,
            aggregate, and operational only.
          </Text>

          <h2>4. Commercial Communications & CAN-SPAM Act</h2>
          <Text>
            All marketing, launch, and waitlist announcement emails sent by Vox
            contain an explicit opt-out / unsubscribe mechanism and our physical
            mailing address. You can unsubscribe at any time with a single click.
          </Text>

          <h2>5. Subscriptions & Renewal Terms (California ARL)</h2>
          <Text>
            Paid subscriptions clearly present pricing, billing frequency, and
            cancellation terms prior to checkout. You may cancel recurring
            subscriptions at any time through your account settings or by
            contacting support with immediate effect.
          </Text>

          <h2>6. DMCA & Copyright Safe Harbor</h2>
          <Text>
            Vox respects intellectual property rights in compliance with 17 U.S.C.
            § 512. Inquiries regarding alleged copyright infringement or notices
            under the Digital Millennium Copyright Act should be addressed to our
            Designated Copyright Agent at{" "}
            <a href="mailto:dmca@voxagent.in">dmca@voxagent.in</a>.
          </Text>

          <h2>7. Administration Sign-in & Data Retention</h2>
          <Text>
            Administrators sign in via Google OAuth. Sessions are protected by
            encrypted, HTTP-only session cookies. Authorized administrators access
            only data strictly necessary for maintenance and support.
          </Text>

          <LinkButton href="/" variant="secondary">
            Back to Vox
          </LinkButton>
        </Stack>
      </Section>
    </main>
  );
}
