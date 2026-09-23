import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vox account",
  robots: { index: false, follow: false },
};

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
