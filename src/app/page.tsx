import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import {
  Hero,
  CapabilitiesStrip,
  FollowThroughSection,
  FeatureSection,
  DemoSection,
  StorySection,
  PrinciplesSection,
  LatestSection,
  ClosingSection,
} from "@/components/marketing/sections";
import {
  BlueprintFrame,
  PageNoise,
} from "@/components/marketing/blueprint-frame";

export default function HomePage() {
  return (
    <>
      <PageNoise />
      <SiteHeader />
      <BlueprintFrame>
        <main id="main">
          <Hero />
          <CapabilitiesStrip />
          <FollowThroughSection />
          <FeatureSection />
          <DemoSection />
          <StorySection />
          <PrinciplesSection />
          <LatestSection />
          <ClosingSection />
        </main>
      </BlueprintFrame>
      <SiteFooter />
    </>
  );
}
