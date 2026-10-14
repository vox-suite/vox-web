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
import "./home.css";
import { SITE_URL } from "@/lib/site";

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
  themeColor: "#040506",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vox — Your chief of staff, on speed dial.",
    template: "%s · Vox",
  },
  description:
    "Call Vox to ask about your day, your spending or what comes next, no app or mobile data needed. Vox can also call you for reminders you set and urgent updates you've enabled.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vox — Your chief of staff, on speed dial.",
    description:
      "Call Vox to ask about your day, your spending or what comes next, no app or mobile data needed. Vox can also call you for reminders you set and urgent updates you've enabled.",
    url: SITE_URL,
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
    title: "Vox — Your chief of staff, on speed dial.",
    description:
      "Call Vox to ask about your day, your spending or what comes next, no app or mobile data needed. Vox can also call you for reminders you set and urgent updates you've enabled.",
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
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Vox",
      description: "A personal agent you reach by phone call, connected to the accounts you choose.",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#application`,
      name: "Vox",
      url: SITE_URL,
      applicationCategory: "ProductivityApplication",
      operatingSystem: "macOS, Windows, Android",
      description:
        "A personal agent you can call by phone. It answers from the accounts you connect, shows its sources, and can call you for reminders you set.",
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
