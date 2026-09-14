import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://voxagent.in"),
  title: { default: "Vox — Your chief of staff, on speed dial", template: "%s · Vox" },
  description:
    "The smartest person in the room is now one phone call away. Calendar, commitments, priorities—handled before you hang up.",
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
