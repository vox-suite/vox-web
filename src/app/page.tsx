import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import {
  Hero,
  Manifesto,
  CallChapter,
  Anatomy,
  Surfaces,
  Connections,
  Trust,
  SelfHost,
  Closing,
} from "@/components/marketing/cinema";
import { LatestSection, FAQSection } from "@/components/marketing/sections";
import { PageNoise } from "@/components/marketing/blueprint-frame";

export default function HomePage() {
  return (
    <>
      <PageNoise />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Manifesto />
        <CallChapter />
        <Anatomy />
        <Surfaces />
        <Connections />
        <Trust />
        <SelfHost />
        <LatestSection />
        <FAQSection />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
