import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import { TermsSection } from "./section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Vox.",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <TermsSection />
      </main>
      <SiteFooter />
    </>
  );
}
