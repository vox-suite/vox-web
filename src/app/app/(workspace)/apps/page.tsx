import type { Metadata } from "next";
import { AppsScreen } from "@/features/apps/components/apps-screen";

export const metadata: Metadata = { title: "Apps and skills" };

export default function Page() {
  return <AppsScreen />;
}
