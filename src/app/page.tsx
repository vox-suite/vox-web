import { HomePage } from "@/components/home/home-page";
import { StructuredData } from "@/components/ui/structured-data";
import { pageMetadata, SITE_DESCRIPTION } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata = pageMetadata({ title: "Personal AI Assistant by Phone", description: SITE_DESCRIPTION, path: "/" });
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Vox", url: SITE_URL, logo: `${SITE_URL}/icon-192.png` },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Vox", url: SITE_URL, description: SITE_DESCRIPTION, publisher: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en" },
    { "@type": "WebPage", "@id": `${SITE_URL}/#page`, name: "Vox | Personal AI Assistant by Phone", url: `${SITE_URL}/`, description: SITE_DESCRIPTION, isPartOf: { "@id": `${SITE_URL}/#website` } },
  ],
};
export default function Page() { return <><StructuredData data={schema} /><HomePage /></>; }
