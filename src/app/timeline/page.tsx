import { TimelinePage } from "@/components/timeline-marketing/timeline-page";
import { StructuredData } from "@/components/ui/structured-data";
import { pageMetadata, pageSchema } from "@/lib/seo";
const title = "Timeline: Your Days, Connected";
const description = "Bring receipts, meetings, music and imported places into one timeline. Explore day, week and month views, source evidence and account controls in Vox.";
export const metadata = pageMetadata({ title, description, path: "/timeline", image: "timeline" });
export default function Page() { return <><StructuredData data={pageSchema(title, description, "/timeline")} /><TimelinePage /></>; }
