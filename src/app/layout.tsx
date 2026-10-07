import type { Metadata, Viewport } from "next";
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
  weight: ["400"],
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
  themeColor: "#040506",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://callvox.si"),
  title: {
    default: "Vox — Your life, understood. Your next move, clearer.",
    template: "%s · Vox",
  },
  description:
    "Bring your days, ideas, and connected world together. Explore Spans, Spaces, Pulse, and a personal AI assistant across desktop, Android, and voice.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vox — Your life, understood. Your next move, clearer.",
    description:
      "Bring your days, ideas, and connected world together. Explore Spans, Spaces, Pulse, and a personal AI assistant across desktop, Android, and voice.",
    url: "https://callvox.si",
    siteName: "Vox",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/vox.svg",
        width: 800,
        height: 600,
        alt: "Vox Logo and Brand Wordmark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vox — Your life, understood. Your next move, clearer.",
    description:
      "Bring your days, ideas, and connected world together. Explore Spans, Spaces, Pulse, and a personal AI assistant across desktop, Android, and voice.",
    images: ["/vox.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: { icon: "/vox.svg" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://callvox.si/#website",
      url: "https://callvox.si",
      name: "Vox",
      description: "Personal AI assistant across desktop, Android, and voice.",
      publisher: {
        "@id": "https://callvox.si/#organization",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://callvox.si/#application",
      name: "Vox",
      url: "https://callvox.si",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Telephony, Desktop, Android, Web",
      description:
        "Personal AI assistant connecting your timeline, planning, and insights through Spans, Spaces, and Pulse across desktop, Android, and voice.",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        newsreader.variable,
        jetbrainsMono.variable,
        spaceGrotesk.variable,
        inter.variable,
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
