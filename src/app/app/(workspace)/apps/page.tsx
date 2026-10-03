import type { Metadata } from "next";
import { AppsScreen } from "@/features/apps/components/apps-screen";

export const metadata: Metadata = { title: "Connectors" };

export default function Page() {
  return <AppsScreen />;
}
