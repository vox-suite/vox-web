import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  alternates: { canonical: "/privacy-policy" },
};

const sections: LegalSection[] = [
  {
    heading: "Information we collect",
    paragraphs: ["We collect only what Vox needs to do what you ask."],
    items: [
      "Account details such as your name, email address and phone number.",
      "Call and message content, including transcripts and the tasks, reminders and follow-ups created from them.",
      "Data from services you choose to connect, such as Google Calendar (see below).",
      "Basic usage and device information used to keep Vox reliable and secure.",
    ],
  },
  {
    heading: "Google user data",
    paragraphs: [
      "If you connect Google Calendar, Vox requests read-only access to your calendar events (the calendar.events.readonly scope) and your Google account email and basic profile (userinfo.email and userinfo.profile).",
      "We use calendar events only to answer your questions and plan your schedule, for example telling you what is on tomorrow or when you are free. Vox never creates, edits or deletes your events. Events are fetched when needed, and your access tokens are encrypted at rest.",
      "We do not sell Google user data, share it with third parties except service providers that process it for us under confidentiality obligations, use it for advertising, or use it to train generalized AI models. No human reads it unless you ask for support, it is needed for security or abuse investigation, or the law requires it.",
      "Vox's use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.",
    ],
  },
  {
    heading: "How we use information",
    paragraphs: [],
    items: [
      "To understand your requests and carry them out.",
      "To keep your tasks, reminders and follow-ups in sync.",
      "To secure the service, prevent abuse and fix problems.",
      "To contact you about your account or changes to Vox.",
    ],
  },
  {
    heading: "Sharing",
    paragraphs: [
      "We do not sell your personal information. We share it only with infrastructure, telephony and AI providers that process it on our behalf to run Vox, when you direct us to act on a connected service, or when the law requires it.",
    ],
  },
  {
    heading: "Retention and deletion",
    paragraphs: [
      "We keep your data while your account is active. You can disconnect Google Calendar at any time in Vox, which deletes the stored tokens. You can also revoke access at myaccount.google.com/permissions. To delete your account and data, email us and we will do so within 30 days, unless the law requires us to keep something.",
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "Connections use HTTPS, and credentials from connected services are encrypted at rest. No system is perfectly secure, but we work to protect your information and limit who can reach it.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You can access, correct, export or delete your information, and withdraw consent to any connected service, by contacting us.",
    ],
  },
  {
    heading: "Changes and contact",
    paragraphs: [
      "We will update this page when our practices change and revise the date above. Questions or requests: rahul.id39@gmail.com.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="5 October 2026"
      intro="This policy explains what Vox collects, how it is used and the control you have. Vox is a voice-first assistant available at callvox.si."
      sections={sections}
    />
  );
}
