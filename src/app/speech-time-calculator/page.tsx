import type { Metadata } from "next";
import { SpeechTimeTool } from "@/components/marketing/speech-time-tool";
import { FAQ } from "@/lib/speech-time";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/speech-time-calculator`;
const title = "Speech Time Calculator: Words to Minutes (Free)";
const description =
  "Paste your speech and see how long it takes to say out loud. Free speech time calculator with word count, slow, normal and fast pace. No signup.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: "website", siteName: "Vox" },
  twitter: { card: "summary", title, description },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${url}#app`,
      name: "Speech Time Calculator",
      url,
      description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Vox", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Speech time calculator", item: url },
      ],
    },
  ],
};

export default function SpeechTimeCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SpeechTimeTool />
    </>
  );
}
