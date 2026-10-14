import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import {
  JetBrains_Mono,
  Newsreader,
  Space_Grotesk,
  Inter,
} from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import "./landing.css";
import "./home.css";
import { SITE_URL } from "@/lib/site";
import { SITE_DESCRIPTION } from "@/lib/seo";
import { VOX_THEME } from "@/lib/vox-tokens";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: "variable",
  axes: ["opsz"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: VOX_THEME.light.background },
    { media: "(prefers-color-scheme: dark)", color: VOX_THEME.dark.background },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Vox",
  verification: { other: { "msvalidate.01": "AA6D6183228CAD9CACFCBF57FB1338BD" } },
  title: { default: "Vox | Personal AI Assistant by Phone", template: "%s | Vox" },
  description: SITE_DESCRIPTION,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  icons: { icon: [{ url: "/vox.svg", type: "image/svg+xml" }, { url: "/icon-192.png", type: "image/png", sizes: "192x192" }], apple: "/apple-touch-icon.png" },
  openGraph: { title: "Vox | Personal AI Assistant by Phone", description: SITE_DESCRIPTION, siteName: "Vox", type: "website", images: [{ url: "/social/home.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Vox | Personal AI Assistant by Phone", description: SITE_DESCRIPTION, images: ["/social/home.png"] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        newsreader.variable,
        jetbrainsMono.variable,
        spaceGrotesk.variable,
        inter.variable,
      )}
    >
      <head>
        <Script id="vox-theme-init" strategy="beforeInteractive">
          {`(function(){var r=document.documentElement,m=matchMedia("(prefers-color-scheme: light)"),p="auto";try{p=localStorage.getItem("vox-theme")||"auto"}catch(e){}r.dataset.themePref=p;function a(){var q=r.dataset.themePref;r.dataset.theme=q==="light"||q==="dark"?q:m.matches?"light":"dark"}a();m.addEventListener("change",a)})()`}
        </Script>

      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
