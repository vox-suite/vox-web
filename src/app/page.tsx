import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import {
  Hero,
  FollowThroughSection,
  DemoSection,
  FeatureSection,
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
        <FollowThroughSection />
        <DemoSection />
        <FeatureSection />
        <StorySection />
        <PrinciplesSection />
        <LatestSection />
        <ClosingSection />
      </main>
      <SiteFooter />
    </>
  );
}
