import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import {
  Hero,
  Capabilities,
  DemoSection,
  FeatureSection,
  StorySection,
  PrinciplesSection,
  ClosingSection,
} from "@/components/marketing/sections";
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Capabilities />
        <DemoSection />
        <FeatureSection />
        <StorySection />
        <PrinciplesSection />
        <ClosingSection />
      </main>
      <SiteFooter />
    </>
  );
}
