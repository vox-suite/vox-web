import { Section, Stack, Text, LinkButton } from "@/components/ui";

export function TermsSection() {
  return (
    <div className="pt-16 md:pt-24">
      <Section>
        <Stack gap="large">
          <h1>Terms of Service</h1>
          <Text muted>
            Last updated: October 2026. By accessing or using Vox, including by
            phone call, WhatsApp, or the web, you agree to these terms.
          </Text>

          <h2>1. The Service</h2>
          <Text>
            Vox is a voice-first assistant that helps you manage calendars,
            tasks, reminders, and follow-ups. Features may change, and access
            may be limited to invited users.
          </Text>

          <h2>2. Eligibility & Accounts</h2>
          <Text>
            You must be at least 18 years old (or 13+ with parental
            authorization). You are responsible for your account, the
            connections you authorize, and all activity under them. Keep your
            credentials secure.
          </Text>

          <h2>3. Acceptable Use</h2>
          <Text>
            Do not use Vox to break the law, harass others, send spam, place
            unlawful or unsolicited calls, infringe rights, or probe, disrupt,
            or reverse engineer the service.
          </Text>

          <h2>4. Actions on Your Behalf</h2>
          <Text>
            Vox acts on your instructions and the permissions you grant to
            connected services. AI output can be wrong; review important actions
            such as messages, calls, and calendar changes. You are responsible
            for actions you direct or approve.
          </Text>

          <h2>5. Your Content</h2>
          <Text>
            You retain ownership of your content. You grant Vox a limited
            license to process it solely to operate and improve the service, as
            described in our <a href="/privacy-policy">Privacy Policy</a>.
          </Text>

          <h2>6. Third-Party Services</h2>
          <Text>
            Vox integrates with third-party services such as Google, WhatsApp,
            and telephony providers. Your use of those services is governed by
            their own terms, and we are not responsible for them.
          </Text>

          <h2>7. Fees</h2>
          <Text>
            Paid plans, if any, are presented with pricing, billing frequency,
            and cancellation terms before checkout. You may cancel at any time.
          </Text>

          <h2>8. Termination</h2>
          <Text>
            You may stop using Vox at any time. We may suspend or terminate
            access for violations of these terms or to protect the service.
          </Text>

          <h2>9. Disclaimers & Liability</h2>
          <Text>
            Vox is provided &ldquo;as is&rdquo; without warranties of any kind.
            To the fullest extent permitted by law, Vox is not liable for
            indirect or consequential damages, and total liability is limited to
            the amount you paid in the twelve months before the claim.
          </Text>

          <h2>10. Changes & Contact</h2>
          <Text>
            We may update these terms; continued use means you accept the
            update. Questions: <a href="mailto:legal@voxagent.in">legal@voxagent.in</a>.
          </Text>

          <LinkButton href="/" variant="secondary">
            Back to Vox
          </LinkButton>
        </Stack>
      </Section>
    </div>
  );
}
