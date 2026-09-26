import type { Metadata } from "next";
import { RemindersScreen } from "@/features/reminders/components/reminders-screen";

export const metadata: Metadata = { title: "Reminders" };

export default function Page() {
  return <RemindersScreen />;
}
