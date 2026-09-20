import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/marketing/shell";
import { ChangelogView } from "@/components/changelog/changelog-view";

export const metadata: Metadata = {
  title: "Changelog — Vox",
  description:
    "Explore the complete engineering evolution and release history of Vox. Track milestones in zero-latency voice telephony, edge VAD, voice biometrics, and autonomous cognition.",
  openGraph: {
    title: "Changelog — Vox",
    description:
      "Explore the complete engineering evolution and release history of Vox with dates, metrics, and architecture milestones.",
  },
};

export default function ChangelogPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <ChangelogView />
      </main>
      <SiteFooter />
    </>
  );
}
