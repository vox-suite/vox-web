import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import { RequestAccessSection } from "./section";

export const metadata: Metadata = {
  title: "Request access",
  description: "Tell us about your work and join the Vox early access list.",
};

export default function RequestAccessPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <RequestAccessSection />
      </main>
      <SiteFooter />
    </>
  );
}
