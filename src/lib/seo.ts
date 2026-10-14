import type { Metadata } from "next";
import { SITE_URL } from "./site";

export const SITE_DESCRIPTION = "Vox is a personal AI assistant you can call. Connect your accounts, understand your day, and set reminders and follow-ups by phone, message or app.";

export function pageMetadata({ title, description, path, image = "home" }: {
  title: string; description: string; path: string; image?: string;
}): Metadata {
  const fullTitle = `${title} | Vox`;
  const url = `${SITE_URL}${path}`;
  const images = [{ url: `${SITE_URL}/social/${image}.png`, width: 1200, height: 630, alt: fullTitle }];
  return {
    title: { absolute: fullTitle }, description,
    alternates: { canonical: url },
    openGraph: { title: fullTitle, description, url, siteName: "Vox", type: "website", locale: "en_US", images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}

export function pageSchema(title: string, description: string, path: string) {
  const url = `${SITE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#page`, name: title, description, url, inLanguage: "en", isPartOf: { "@id": `${SITE_URL}/#website` }, publisher: { "@id": `${SITE_URL}/#organization` } },
      { "@type": "BreadcrumbList", "@id": `${url}#breadcrumbs`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Vox", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: title, item: url },
      ] },
    ],
  };
}
