import { DownloadsPage } from "@/components/marketing/downloads-page";
import { StructuredData } from "@/components/ui/structured-data";
import { pageMetadata, pageSchema } from "@/lib/seo";
const title = "Downloads for Windows, Mac and Android";
const description = "Find Vox for Windows, Mac and Android. Get availability updates for the personal AI assistant you can reach by phone, message and app.";
export const metadata = pageMetadata({ title, description, path: "/download" });
export default function Page() { return <><StructuredData data={pageSchema(title, description, "/download")} /><DownloadsPage /></>; }
