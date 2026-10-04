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
import { FAQSection } from "@/components/marketing/faq-section";

export default function HomePage() {
  return (
    <>
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
        <FAQSection />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
