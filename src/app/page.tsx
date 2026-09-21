import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import {
  Hero,
  Capabilities,
  DemoSection,
  FeatureSection,
  FollowThroughSection,
  StorySection,
  PrinciplesSection,
  LatestSection,
  ClosingSection,
} from "@/components/marketing/sections";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Capabilities />
        <FollowThroughSection />
        <FeatureSection />
        <DemoSection />
        <StorySection />
        <PrinciplesSection />
        <LatestSection />
        <ClosingSection />
      </main>
      <SiteFooter />
    </>
  );
}
