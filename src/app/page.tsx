import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import { Hero } from "@/components/marketing/hero";
import {
  CallChapter,
  UseCases,
  Surfaces,
  Connections,
  Trust,
  Closing,
} from "@/components/marketing/cinema";
import { FAQSection } from "@/components/marketing/faq-section";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <CallChapter />
        <UseCases />
        <Surfaces />
        <Connections />
        <Trust />
        <FAQSection />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
