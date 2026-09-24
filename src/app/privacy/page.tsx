import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import { PrivacySection } from "./section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Compliance",
  description:
    "Privacy policy, security commitments, and legal compliance disclosures for Vox.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <PrivacySection />
      </main>
      <SiteFooter />
    </>
  );
}
