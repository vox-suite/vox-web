import type { Metadata } from "next";
import { TimelinePage } from "@/components/timeline-marketing/timeline-page";

export const metadata: Metadata = {
  title: "Timeline | Your days, brought together",
  description: "A day-by-day record from connected accounts and imported history, with day, week and month views, source evidence and account controls.",
  alternates: { canonical: "/timeline" },
};

export default function Page() { return <TimelinePage />; }
