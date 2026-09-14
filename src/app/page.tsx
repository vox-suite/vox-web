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
import { InteractiveEffects } from "@/components/marketing/interactive-effects";

export default function HomePage() {
  return (
    <>
      <InteractiveEffects />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Capabilities />
        <FeatureSection />
        <DemoSection />
        <StorySection />
        <PrinciplesSection />
        <ClosingSection />
      </main>
      <SiteFooter />
    </>
  );
}
