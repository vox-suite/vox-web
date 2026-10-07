import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms of service",
  alternates: { canonical: "/terms-of-service" },
};

const sections: LegalSection[] = [
  {
    heading: "Using Vox",
    paragraphs: [
      "You must be able to form a binding contract and use Vox lawfully. You are responsible for your account and for activity under it.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: ["You agree not to:"],
    items: [
      "Use Vox to break the law or infringe anyone's rights.",
      "Attempt to disrupt, probe or gain unauthorised access to the service.",
      "Use Vox to harass, deceive or send unsolicited bulk messages or calls.",
      "Record or contact other people through Vox without any consent the law requires.",
    ],
  },
  {
    heading: "Connected services",
    paragraphs: [
      "You can connect third-party services such as Google Calendar. You authorise Vox to access them only as described in our privacy policy, and you can disconnect them at any time. Those services have their own terms.",
    ],
  },
  {
    heading: "AI output",
    paragraphs: [
      "Vox uses AI and can make mistakes. Check important details such as times, names and commitments before relying on them.",
    ],
  },
  {
    heading: "Your content",
    paragraphs: [
      "You keep ownership of what you give Vox. You grant us a limited licence to process it to provide and improve the service for you.",
    ],
  },
  {
    heading: "Availability and changes",
    paragraphs: [
      "We may change, suspend or end features, and we may suspend accounts that break these terms. We aim for a reliable service but do not guarantee uninterrupted availability.",
    ],
  },
  {
    heading: "Disclaimer and liability",
    paragraphs: [
      "Vox is provided as is, without warranties of any kind. To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability is limited to the amount you paid for Vox in the 12 months before the claim.",
    ],
  },
  {
    heading: "Changes and contact",
    paragraphs: [
      "We may update these terms and will revise the date above. Continued use after a change means you accept it. Questions: rahul.id39@gmail.com.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="5 October 2026"
      intro="These terms govern your use of Vox at callvox.si. By using Vox you agree to them."
      sections={sections}
    />
  );
}
