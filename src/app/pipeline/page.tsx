import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import { PublicPipelinePage } from "@/components/pipeline/public-pipeline-page";

export const metadata: Metadata = {
  title: "Pipeline Architecture \u2014 Vox",
  description:
    "Interactive Excalidraw-style flow builder and architectural diagram of the real-time Vox Bridge and Core Agent voice pipeline.",
  openGraph: {
    title: "Pipeline Architecture \u2014 Vox",
    description:
      "Interactive flow builder and visual execution graph of Vox Bridge, Jev System One, and Core Agent.",
  },
};

export default function PipelinePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <PublicPipelinePage />
      </main>
      <SiteFooter />
    </>
  );
}
