import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://voxagent.in"),
  title: { default: "Vox — Your life, one call away", template: "%s · Vox" },
  description:
    "A personal AI assistant you can reach with a simple phone call. Clear mental clutter and make room for what matters.",
  icons: { icon: "/vox.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
