import type { Metadata } from "next";
import { PrivacyScreen } from "@/features/privacy/components/privacy-screen";

export const metadata: Metadata = { title: "Privacy and data" };

export default function Page() {
  return <PrivacyScreen />;
}
