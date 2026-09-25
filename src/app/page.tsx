import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import {
  Hero,
  SocialProofBar,
  BenefitsGrid,
  DemoSection,
  LatestSection,
  ClosingSection,
} from "@/components/marketing/sections";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <SocialProofBar />
        <BenefitsGrid />
        <DemoSection />
        <LatestSection />
        <ClosingSection />
      </main>
      <SiteFooter />
    </>
  );
}
