import { ProjectsPage } from "@/components/projects-marketing/projects-page";
import { StructuredData } from "@/components/ui/structured-data";
import { pageMetadata, pageSchema } from "@/lib/seo";
const title = "Projects: Ask Your Work How It Works";
const description = "Point Vox at your code, specs or notes. Ask a question and get a diagram that explains it, with the exact lines behind every box. Your files stay on your computer.";
export const metadata = pageMetadata({ title, description, path: "/projects" });
export default function Page() { return <><StructuredData data={pageSchema(title, description, "/projects")} /><ProjectsPage /></>; }
