import type { Metadata } from "next";
import { JourneysScreen } from "@/features/journeys/components/journeys-screen";

export const metadata: Metadata = { title: "Journeys" };

export default function Page() {
  return <JourneysScreen />;
}
