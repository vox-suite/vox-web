import type { Metadata } from "next";
import { ApprovalsScreen } from "@/features/proposals/components/approvals-screen";

export const metadata: Metadata = { title: "Approvals" };

export default function Page() {
  return <ApprovalsScreen />;
}
